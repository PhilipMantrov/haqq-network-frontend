import { createContext, ReactNode, useCallback, useMemo } from 'react';
import { Tendermint34Client, WebsocketClient } from '@cosmjs/tendermint-rpc';
import {
  QueryClient,
  setupStakingExtension,
  StakingExtension,
  setupDistributionExtension,
  DistributionExtension,
} from '@cosmjs/stargate';
import { useCosmosClient } from '../hooks/useCosomsClient';
import {
  bondStatusToJSON,
  BondStatus,
  Validator,
  Params as StakingParams,
} from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import {
  generateEndpointBroadcast,
  generatePostBodyBroadcast,
  generateEndpointAccount,
  generateEndpointGetDelegations,
  generateEndpointGetValidators,
  generateEndpointGetUndelegations,
  generateEndpointDistributionRewardsByAddress,
} from '@evmos/provider';
import { signatureToPubkey } from '@hanchon/signature-to-pubkey';
import { BondStatusString } from '@cosmjs/stargate/build/modules/staking/queries';
import { useSigner } from 'wagmi';
import store from 'store2';

// TODO: Move to config/environment
const cosmosRestEndpoint = 'https://rest.cosmos.testedge2.haqq.network';
const tmRpcWsEndpoint = 'wss://rpc.tm.testedge2.haqq.network';
const tmRpcEndpoint = 'https://rpc.tm.testedge2.haqq.network';

// const cosmosRestEndpoint = 'http://192.168.1.86:1317';
// const tmRpcWsEndpoint = 'wss://rpc.tm.testedge2.haqq.network';
// const tmRpcEndpoint = 'http://192.168.1.86:26657';

interface ComsosClient
  extends QueryClient,
    StakingExtension,
    DistributionExtension {}

type Signer = {
  signMessage: (message: string) => Promise<string>;
};

// TODO: typings
interface ComsosService {
  getPaginatedValidators: (params: { pageParam?: Uint8Array }) => Promise<{
    pages: Validator[];
    pageParam?: Uint8Array;
  }>;
  getValidatorInfo: (address: string) => Promise<Validator | undefined>;
  getStakingParams: () => Promise<StakingParams | undefined>;
  generatePubkey: () => Promise<string>;
  getPubkey: (address: string) => Promise<string>;

  getAccountInfo: any;
  broadcastTransaction: any;
  getAccountDelegations: any;
  getRewardsInfo: any;
  getAllValidators: any;
  getUndelegations: any;
}

export const TendermintClientContext = createContext<
  Tendermint34Client | undefined
>(undefined);
export const CosmosClientContext = createContext<ComsosClient | undefined>(
  undefined,
);
export const CosmosServiceContext = createContext<ComsosService | undefined>(
  undefined,
);

export async function createTendermintClient() {
  const tmClient = await Tendermint34Client.connect(tmRpcEndpoint);
  // const tmWsClient = new WebsocketClient(tmRpcWsEndpoint);
  // const tmClient = await Tendermint34Client.create(tmWsClient);

  return tmClient;
}

export function CosmosProvider({
  children,
  tendermintClient,
}: {
  children: ReactNode;
  tendermintClient: Tendermint34Client;
}) {
  const cosmosClient = useMemo(() => {
    return QueryClient.withExtensions(
      tendermintClient,
      setupStakingExtension,
      setupDistributionExtension,
    );
  }, [tendermintClient]);

  return (
    <TendermintClientContext.Provider value={tendermintClient}>
      <CosmosClientContext.Provider value={cosmosClient}>
        <CosmosServiceContainer>{children}</CosmosServiceContainer>
      </CosmosClientContext.Provider>
    </TendermintClientContext.Provider>
  );
}

function createCosmosService(
  cosmosClient: ComsosClient,
  signer?: Signer,
): ComsosService {
  async function getAllValidators(limit = 1000) {
    const response = await fetch(
      `${cosmosRestEndpoint}${generateEndpointGetValidators()}?pagination.limit=${limit}`,
      {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = await response.json();

    return data.validators;
  }

  async function getPaginatedValidators({
    pageParam,
  }: {
    pageParam?: Uint8Array;
  }) {
    const validatorsResponse = await cosmosClient.staking.validators(
      bondStatusToJSON(BondStatus.BOND_STATUS_BONDED) as BondStatusString,
      pageParam,
    );

    // console.log({ validatorsResponse });

    return {
      pages: validatorsResponse.validators,
      pageParam: validatorsResponse.pagination?.nextKey,
    };
  }

  async function getValidatorInfo(address: string) {
    // console.log('getValidatorInfo', { address });
    const validatorInfoResponse = await cosmosClient.staking.validator(address);
    // console.log({ validatorInfoResponse });

    return validatorInfoResponse.validator;
  }

  async function getStakingParams() {
    // console.log('getStakingParams');
    const { params: stakingParams } = await cosmosClient.staking.params();
    // console.log({ stakingParams });

    return stakingParams;
  }

  async function getRewardsInfo(address: string) {
    // console.log('getRewardsInfo');
    // const info = await cosmosClient.distribution.delegationTotalRewards(
    //   address,
    // );

    const info = await fetch(
      `${cosmosRestEndpoint}/${generateEndpointDistributionRewardsByAddress(
        address,
      )}`,
    );

    return await info.json();
  }

  async function getUndelegations(address: string) {
    const undelegationsResponse = await fetch(
      `${cosmosRestEndpoint}/${generateEndpointGetUndelegations(address)}`,
    );
    const undelegations = await undelegationsResponse.json();

    return undelegations.unbonding_responses;
  }

  async function getAccountInfo(address: string) {
    // console.log('getAccountInfo', address);
    const fetchedAcc = await fetch(
      `${cosmosRestEndpoint}/${generateEndpointAccount(address)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const acc = await fetchedAcc.json();

    return acc.account.base_account;
  }

  async function broadcastTransaction(txToBroadcast: any) {
    // console.log('broadcastTransaction', {
    //   txToBroadcast,
    //   foo: txToBroadcast.message.serializeBinary(),
    // });

    const broadcastResponse = await fetch(
      `${cosmosRestEndpoint}${generateEndpointBroadcast()}`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: generatePostBodyBroadcast(txToBroadcast),
      },
    );

    return await broadcastResponse.json();
  }

  async function getAccountDelegations(address: string) {
    const delegations = await fetch(
      `${cosmosRestEndpoint}/${generateEndpointGetDelegations(address)}`,
    );

    return await delegations.json();
  }

  async function generatePubkey() {
    if (signer) {
      const signature = await signer.signMessage('generate_pubkey');
      const pubkey = signatureToPubkey(
        signature,
        Buffer.from([
          50, 215, 18, 245, 169, 63, 252, 16, 225, 169, 71, 95, 254, 165, 146,
          216, 40, 162, 115, 78, 147, 125, 80, 182, 25, 69, 136, 250, 65, 200,
          94, 178,
        ]),
      );

      return pubkey;
    } else {
      throw new Error('No signer');
    }
  }

  async function getPubkey(address: string) {
    const storeKey = `pubkey_${address}`;
    const savedPubKey = store.get(storeKey);

    if (!savedPubKey) {
      try {
        const generatedPubkey = await generatePubkey();
        console.log({ generatedPubkey });
        store.set(storeKey, generatedPubkey);
        return generatedPubkey;
      } catch (error) {
        console.error((error as any).message);
        throw new Error((error as any).message);
      }
    }

    console.log('return saved pubkey');
    return savedPubKey;
  }

  return {
    getPaginatedValidators,
    getValidatorInfo,
    getStakingParams,
    getAccountInfo,
    broadcastTransaction,
    getAccountDelegations,
    generatePubkey,
    getRewardsInfo,
    getAllValidators,
    getUndelegations,
    getPubkey,
  };
}

export function CosmosServiceContainer({ children }: { children: ReactNode }) {
  const { data: signer } = useSigner();
  const cosmosClient = useCosmosClient();
  const cosmosService = useMemo(() => {
    return createCosmosService(cosmosClient, signer as Signer | undefined);
  }, [cosmosClient, signer]);

  return (
    <CosmosServiceContext.Provider value={cosmosService}>
      {children}
    </CosmosServiceContext.Provider>
  );
}
