import { Alert, Card, Heading, Modal, ModalCloseButton } from '@haqq/ui-kit';
import {
  DelegateModalDetails,
  DelegateModalInput,
  DelegateModalSubmitButton,
} from '../delegate-modal/delegate-modal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useDelegation } from '../../hooks/useDelegation';
import { useQueryClient } from '@tanstack/react-query';

export interface UndelegateModalProps {
  isOpen: boolean;
  validatorAddress: string;
  symbol: string;
  balance: number;
  delegation: number;
  unboundingTime: number;
  onClose: () => void;
}

export function UndelegateModal({
  isOpen,
  onClose,
  symbol,
  balance,
  delegation,
  unboundingTime,
  validatorAddress,
}: UndelegateModalProps) {
  const { undelegate } = useDelegation();
  const [undelegateAmount, setUndelegateAmount] = useState(0);
  const [isUndelegateEnabled, setUndelegateEnabled] = useState(true);
  const [amountError, setAmountError] = useState<undefined | 'min' | 'max'>(
    undefined,
  );
  const queryClient = useQueryClient();

  const handleMaxButtonClick = useCallback(() => {
    setUndelegateAmount(delegation);
  }, [delegation]);

  const handleInputChange = useCallback((value: number) => {
    setUndelegateAmount(value);
  }, []);

  const handleUpdateQueries = useCallback(() => {
    queryClient.invalidateQueries(['rewards']);
    queryClient.invalidateQueries(['delegation']);
    queryClient.invalidateQueries(['unboundings']);
  }, [queryClient]);

  const handleSubmitUndelegate = useCallback(async () => {
    try {
      const txHash = await undelegate(validatorAddress, undelegateAmount);
      console.log('handleSubmitUndelegate', { txHash });
      handleUpdateQueries();
      onClose();
      // toast.success(`Undlegation successful ${txHash}`);
      toast.success(`Undlegation successful`);
    } catch (error) {
      console.error((error as any).message);
      toast.error((error as any).message);
    }
  }, [
    handleUpdateQueries,
    onClose,
    undelegate,
    undelegateAmount,
    validatorAddress,
  ]);

  useEffect(() => {
    if (undelegateAmount <= 0) {
      setUndelegateEnabled(false);
      setAmountError('min');
    } else if (undelegateAmount > delegation) {
      setUndelegateEnabled(false);
      setAmountError('max');
    } else {
      setUndelegateEnabled(true);
      setAmountError(undefined);
    }
  }, [delegation, undelegateAmount]);

  const amountHint = useMemo(() => {
    if (amountError === 'min') {
      return <span className="text-islamic-red-500">Bellow minimal value</span>;
    } else if (amountError === 'max') {
      return (
        <span className="text-islamic-red-500">More than your delegation</span>
      );
    }

    return undefined;
  }, [amountError]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="mx-auto w-[420px] !bg-white dark:!bg-slate-700">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-row justify-between items-center">
            <Heading level={3}>Undelegate</Heading>
            <ModalCloseButton onClick={onClose} />
          </div>

          <Alert
            title={`Staking will lock up your funds for ${unboundingTime} days`}
            text={`Once you undelegate your staked ISLM, you will need to wait ${unboundingTime}
              days for your tokens to be liquid`}
          />

          <div className="flex flex-col space-y-1">
            <DelegateModalDetails
              title="My balance"
              value={`${balance.toLocaleString()} ${symbol.toUpperCase()}`}
            />
            <DelegateModalDetails
              title="My delegation"
              value={`${delegation.toLocaleString()} ${symbol.toUpperCase()}`}
            />
          </div>

          <div>
            {/* <div className="mb-1 text-slate-400 text-base leading-6 flex flex-row justify-between">
              <label htmlFor="amount" className="cursor-pointer">
                Amount
              </label>
              <div>
                Available:{' '}
                <span className="text-slate-700 dark:text-slate-100 font-medium">
                  {delegation.toLocaleString()} {symbol.toUpperCase()}
                </span>
              </div>
            </div> */}
            <DelegateModalInput
              symbol="ISLM"
              value={undelegateAmount}
              onChange={handleInputChange}
              onMaxButtonClick={handleMaxButtonClick}
              hint={amountHint}
            />
          </div>

          <div>
            <DelegateModalSubmitButton
              onClick={handleSubmitUndelegate}
              className="w-full"
              disabled={!isUndelegateEnabled}
            >
              Proceed undelegation
            </DelegateModalSubmitButton>
          </div>
        </div>
      </Card>
    </Modal>
  );
}

export default UndelegateModal;
