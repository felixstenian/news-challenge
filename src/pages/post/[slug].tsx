import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import RichText from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
import Header from '../../components/Header';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: string;
    // content: {
    //   heading: string;
    //   body: {
    //     text: string;
    //   }[];
    // }[];
  };
}

interface PostProps {
  post: Post;
}

const Post = ({ post }: PostProps) => {
  // TODO
  console.log(post);

  return (
    <>
      <Head>Post</Head>
      <Header />
      <main className={styles.container}>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="teste" />
        </div>
        <div className={styles.body}>
          <h1>{post.data.title}</h1>
          <article className={styles.infos}>
            <div>
              <FiCalendar />
              <time>{post.first_publication_date}</time>
            </div>
            <div>
              <FiUser />
              <time>{post.data.author}</time>
            </div>
            <div>
              <FiClock />
              <time>4 min</time>
            </div>
          </article>
        </div>
      </main>
      {/* <h1>{post?.data.title || 'Teste'}</h1> */}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('publication', String(slug), {});

  const post = {
    first_publication_date: new Date(
      response.last_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    data: {
      title: response?.data?.title,
      banner: {
        url: response?.data?.banner.url,
      },
      author: response?.data?.author,
      content: RichText.asHtml(response?.data?.content),
    },
  };

  return {
    props: {
      post,
    },
  };
};

export default Post;
