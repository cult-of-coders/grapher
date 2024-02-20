import { _ } from 'meteor/underscore';
import {
  Authors,
  Groups,
  Posts,
  Categories,
  AuthorProfiles,
} from './collections';

const GROUPS = 3;
const CATEGORIES = 3;
const AUTHOR_PER_GROUPS = 3;
const POSTS_PER_AUTHOR = 3;

export let categoryIds = [];
export let groupIds = [];
export let authorIds = [];
export let postIds = [];

export default async function createFixtures() {
  for await (const i of _.range(CATEGORIES)) {
    const categoryId = await Categories.insertAsync({
      name: `Category ${i}`,
    });

    categoryIds.push(categoryId);
  }

  for await (const i of _.range(GROUPS)) {
    const groupId = await Groups.insertAsync({
      name: `Group ${i}`,
    });

    groupIds.push(groupId);
  }

  for await (const groupId of groupIds) {
    for await (const i of _.range(AUTHOR_PER_GROUPS)) {
      const authorId = await Authors.insertAsync({
        name: `Author ${authorIds.length}`,
        createdAt: new Date(),
      });

      const authorProfileId = await AuthorProfiles.insertAsync({
        name: `Author ${authorIds.length}`,
        createdAt: new Date(),
      });

      await (await Authors.getLink(authorId, 'profile')).set(authorProfileId);

      authorIds.push(authorId);

      // link it to the group
      const groupLink = await Authors.getLink(authorId, 'groups');
      groupLink.add(groupId);

      for await (const j of _.range(POSTS_PER_AUTHOR)) {
        await createPost(authorId);
      }
    }
  }
}

async function createPost(authorId) {
  const postId = await Posts.insertAsync({
    title: `Post ${postIds.length}`,
    createdAt: new Date(),
  });

  postIds.push(postId);

  const authorLink = await Posts.getLink(postId, 'author');
  await authorLink.set(authorId);

  const randomCategoryId =
    categoryIds[Math.floor(Math.random() * categoryIds.length)];

  const categoriesLink = await Posts.getLink(postId, 'categories');
  await categoriesLink.add(randomCategoryId, {
    createdAt: new Date(),
  });

  return postId;
}
