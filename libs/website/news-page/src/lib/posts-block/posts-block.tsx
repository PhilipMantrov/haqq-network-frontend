import {
  Heading,
  NewsCard,
  NewsCategory,
  Tab,
  Tabs,
} from '@haqq/website/ui-kit';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

export function PostsBlock({ posts }: { posts: any[] }) {
  const [tab, setTab] = useState<NewsCategory | 'all-news'>('all-news');

  const filteredPosts = useMemo(() => {
    if (tab === 'all-news') {
      return posts;
    }
    return posts.filter((post) => post.type === tab);
  }, [posts, tab]);

  return (
    <section className="flex flex-col  px-[16px] pb-[48px] md:pb-[78px] md:px-[48px] lg:px-[80px] lg:pb-[120px]">
      <div className="flex gap-x-[38px] md:gap-x-[48px]">
        <Heading>Recent posts</Heading>
        <div className="flex items-center relative">
          <div className="bg-white w-[16px] h-[16px]" />
          <div className="h-[1px] w-[3000px] bg-haqq-border absolute" />
        </div>
      </div>
      <Tabs className="mt-[28px] md:mt-[42px] lg:mt-[56px] overflow-x-scroll overflow-y-clip md:overflow-visible md:!border-[#252526]">
        <Tab
          isActive={tab === 'all-news'}
          onClick={() => {
            setTab('all-news');
          }}
          className={clsx(
            tab === 'all-news'
              ? '!text-white border-white'
              : '!text-white/50 border-none',
          )}
        >
          All posts
        </Tab>
        <Tab
          isActive={tab === 'technology'}
          onClick={() => {
            setTab('technology');
          }}
          className={clsx(
            tab === 'technology'
              ? '!text-white border-white'
              : '!text-white/50 border-none',
          )}
        >
          Technology
        </Tab>
        <Tab
          isActive={tab === 'news'}
          onClick={() => {
            setTab('news');
          }}
          className={clsx(
            tab === 'news'
              ? '!text-white border-white'
              : '!text-white/50 border-none',
          )}
        >
          News
        </Tab>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[28px] md:gap-[38px] mt-[28px] md:mt-[36px]">
        {posts &&
          filteredPosts?.map((post) => (
            <NewsCard
              key={post.id}
              category={post.category}
              date={post.date}
              description={post.body}
              imageUrl={post.imageUrl}
              title={post.title}
              id={post.id}
            />
          ))}
      </div>
    </section>
  );
}
