import { Fragment } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@haqq/ui-kit';
import { ValidatorInfo } from '../components/validator-info/validator-info';
import { StakingInfo } from '../components/rewards-info/rewards-info';
import { environment } from '../../environments/environment';

export function ValidatorDetailsPage() {
  if (!environment.stakingAddress) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Fragment>
      <Container>
        <StakingInfo />
      </Container>

      <Container className="flex flex-1">
        <ValidatorInfo validatorAddress={environment.stakingAddress} />
      </Container>
    </Fragment>
  );
}
