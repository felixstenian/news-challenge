import { Document } from '@prismicio/client/types/documents';

// -- Prismic Repo Name
export const repoName = 'news-challenge';

// -- Link resolution rules
// Manages the url links to internal Prismic documents
export const linkResolver = (doc: Document): string => {
  if (doc.type === 'post') {
    return `/blog/${doc.uid}`;
  }
  return '/';
};
