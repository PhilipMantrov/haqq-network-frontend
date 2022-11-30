import { Fragment } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@haqq/ui-kit';
import { ValidatorInfo } from '../components/validator-info/validator-info';
import { StakingInfo } from '../components/rewards-info/rewards-info';

export function ValidatorDetailsPage() {
  let { address } = useParams();
  address = "haqqvaloper1c34s5m4z9n8vrqdx96c67myhmvqspda8f47qyk";

  if (!address) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Fragment>
      <Container>
        <StakingInfo />
      </Container>

      <Container className="flex flex-1">
        <ValidatorInfo validatorAddress={address} />
      </Container>
    </Fragment>
  );
}
