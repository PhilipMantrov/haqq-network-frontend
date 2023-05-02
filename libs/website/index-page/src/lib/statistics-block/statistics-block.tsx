import { useSpring, animated } from 'react-spring';
import { WebsiteIndexPageProps } from '../index-page/index-page';

interface StaticsBlockProps extends WebsiteIndexPageProps {
  startAnimation?: boolean;
}

type BlockStatCardProps = {
  title: string;
  value: number;
  startAnimation?: boolean;
};

export function StatisticsBlockStatCard({
  title,
  value,
  startAnimation,
}: BlockStatCardProps) {
  const { number } = useSpring({
    from: { number: 0 },
    number: startAnimation ? value : 0,
    config: { mass: 1, tension: 20, friction: 10, duration: 4000 },
  });

  return (
    <div>
      <animated.div className="font-serif text-[32px] leading-[42px] font-[500]">
        {number.to((n: number) => n.toFixed(0))}
      </animated.div>
      <div className="font-sans text-[16px] leading-[26px]">{title}</div>
    </div>
  );
}

export function StatisticsBlock({ stats, startAnimation }: StaticsBlockProps) {
  console.log({ startAnimation });

  return (
    <div className="border-t border-haqq-border">
      <div
        className="px-[16px] mx-[16px] sm:pl-0 sm:ml-[63px] sm:mr-0 sm:pr-0 lg:ml-[79px] border-l border-haqq-border"
        id="stats"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] px-[32px] py-[60px]">
          <StatisticsBlockStatCard
            value={stats?.mainnetAccountsCreated}
            title="mainnet accounts created"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.transactionsInLast24Hours}
            title="transactions in the last 24 hours"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.secondsToConsensusFinality}
            title="seconds to consensus finality"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.averageCostPerTransaction}
            title="average cost per transaction"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.era}
            title="era"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.emissionRate}
            title="emission rate"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.emittedAlready}
            title="emitted already"
            startAnimation={startAnimation}
          />
          <StatisticsBlockStatCard
            value={stats?.willBeEmitted}
            title="will be emitted"
            startAnimation={startAnimation}
          />
        </div>
      </div>
    </div>
  );
}
