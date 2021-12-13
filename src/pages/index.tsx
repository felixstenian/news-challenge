import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
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
}

const Home = (props: HomeProps) => {
  const { results, next_page } = props;

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
          {results?.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.infos}>
                  <div>
                    <FiCalendar />
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div>
                    <FiUser />
                    <time>{post.data.author}</time>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          <button type="button" onClick={() => console.log('mais')}>
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
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
    }
  );

  const results = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.last_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        title: post?.data?.title,
        subtitle: post?.data?.subtitle,
        author: post?.data?.author,
      },
    };
  });
  // TODO

  return {
    props: {
      results,
      next_page: response.next_page,
    },
  };
};

export default Home;
