import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../helpers/date';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  previewRef: boolean;
}

const Home = ({ postsPagination, previewRef }: HomeProps) => {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);
  console.log(previewRef);

  const pagination = nextPage => {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const newPost = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post?.data?.title,
              subtitle: post?.data?.subtitle,
              author: post?.data?.author,
            },
          };
        });
        setNextPage(data.next_page);
        setPosts([...posts, ...newPost]);
      });
  };

  return (
    <>
      <Head>
        <title>Home | News Challenge</title>
      </Head>
      <header className={styles.headerContainer}>
        <img src="/Logo.svg" alt="logo" />
      </header>
      <main className={styles.container}>
        <div className={styles.postList}>
          {posts?.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post?.data?.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.infos}>
                  <div>
                    <FiCalendar />
                    <time>{formatDate(post.first_publication_date)}</time>
                  </div>
                  <div>
                    <FiUser />
                    <time>{post.data.author}</time>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {!!nextPage && (
            <button type="button" onClick={() => pagination(nextPage)}>
              Carregar mais posts
            </button>
          )}
          {!!previewRef && (
            <aside>
              <Link href="/api/exit-preview">
                <a className={styles.preview}>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'publication')],
    {
      fetch: [
        'publication.title',
        'publication.subtitle',
        'publication.author',
      ],
      pageSize: 5,
      ref: previewData?.ref ?? null,
    }
  );

  const results = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post?.data?.title,
        subtitle: post?.data?.subtitle,
        author: post?.data?.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: response.next_page,
      },
      previewRef: preview,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

export default Home;
