import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { getPrismicClient } from '../../services/prismic';
import { formatDate } from '../../helpers/date';
import Header from '../../components/Header';

import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Comments from '../../components/Comments';

interface Post {
  uid: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  prevPost: Post;
  nextPost: Post;
}

const Post = ({ post, prevPost, nextPost, preview }: PostProps) => {
  const router = useRouter();

  if (router.isFallback) return <p>Carregando...</p>;

  const readingTime = post.data.content.reduce((acc, time) => {
    const total = RichText.asText(time.body).split(' ');
    const min = Math.ceil(total.length / 200);
    return acc + min;
  }, 0);

  return (
    <>
      <Head>
        <title>{post.data?.title}</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="teste" width="100%" />
        </div>
        <div className={styles.body}>
          <h1>{post.data.title}</h1>
          <article className={commonStyles.infos}>
            <div>
              <FiCalendar />
              <time>{formatDate(post.first_publication_date)}</time>
            </div>
            <div>
              <FiUser />
              <time>{post.data.author}</time>
            </div>
            <div>
              <FiClock />
              <time>{readingTime} min</time>
            </div>
          </article>

          <div className={styles.postContent}>
            {post?.data?.content.map(content => (
              <section key={content.heading}>
                <h2>{content?.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </section>
            ))}
          </div>
          <div className={styles.navigation}>
            <aside>
              <p>{prevPost.data.title}</p>
              {prevPost.uid && (
                <Link href={`/post/${prevPost.uid}`}>Post Anterior</Link>
              )}
            </aside>
            <aside>
              <p>{nextPost.data.title}</p>
              {nextPost.uid && (
                <Link href={`/post/${nextPost.uid}`}>Próximo Anterior</Link>
              )}
            </aside>
          </div>
          <Comments />
          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a className={commonStyles.preview}>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.predicates.at['type.publication']);
  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('publication', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };

  const resPrevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'publication')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const prevPost = {
    uid: resPrevPost?.results[0]?.uid ?? null,
    data: {
      title: resPrevPost?.results[0]?.data.title ?? null,
    },
  };

  const resNextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'publication')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const nextPost = {
    uid: resNextPost?.results[0]?.uid ?? null,
    data: {
      title: resNextPost?.results[0]?.data.title ?? null,
    },
  };

  return {
    props: {
      post,
      preview,
      prevPost,
      nextPost,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

export default Post;
