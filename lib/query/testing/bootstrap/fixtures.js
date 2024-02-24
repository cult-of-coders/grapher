import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import './security/fixtures';

import Authors from './authors/collection';
import Comments from './comments/collection';
import Posts from './posts/collection';
import Tags from './tags/collection';
import Groups from './groups/collection';
import Users from './users/collection';
import { Files } from './files/collection';
import { Projects } from './projects/collection';
import { Products, ProductAttributes } from './products/collection';

await Authors.removeAsync({});
await Comments.removeAsync({});
await Posts.removeAsync({});
await Tags.removeAsync({});
await Groups.removeAsync({});
await Users.removeAsync({});
await Files.removeAsync({});
await Projects.removeAsync({});
await Products.removeAsync({});
await ProductAttributes.removeAsync({});

const AUTHORS = 6;
const POST_PER_USER = 6;
const COMMENTS_PER_POST = 6;
const USERS = 4;
const TAGS = ['JavaScript', 'Meteor', 'React', 'Other'];
const GROUPS = ['JavaScript', 'Meteor', 'React', 'Other'];
const COMMENT_TEXT_SAMPLES = ['Good', 'Bad', 'Neutral'];

console.log('[testing] Loading test fixtures ...');

let tags = await Promise.all(TAGS.map((name) => Tags.insertAsync({ name })));
let groups = await Promise.all(
  GROUPS.map((name) =>
    Groups.insertAsync({
      name,
      createdAt: new Date(),
    }),
  ),
);
let authors = await Promise.all(
  _.range(AUTHORS).map((idx) => {
    return Authors.insertAsync({
      name: 'Author - ' + idx,
      profile: {
        firstName: 'First Name - ' + idx,
        lastName: 'Last Name - ' + idx,
      },
    });
  }),
);

let idx = 1;
for (const author of authors) {
  idx++;
  const authorPostLink = await Authors.getLink(author, 'posts');
  const authorGroupLink = await Authors.getLink(author, 'groups');

  await authorGroupLink.add(groups[idx % 4], {
    isAdmin: _.sample([true, false]),
  });

  for (const idx of _.range(POST_PER_USER)) {
    let post = {
      title: `User Post - ${idx}`,
      metadata: {
        keywords: _.sample(TAGS, _.random(1, 2)),
        language: {
          ..._.sample([
            { abbr: 'en', title: 'English' },
            { abbr: 'de', title: 'Deutsch' },
          ]),
        },
      },
      createdAt: new Date(),
    };

    await authorPostLink.add(post);
    const postCommentsLink = await Posts.getLink(post, 'comments');
    const postTagsLink = await Posts.getLink(post, 'tags');
    const postGroupLink = await Posts.getLink(post, 'group');
    await postGroupLink.set(_.sample(groups), { random: Random.id() });

    await postTagsLink.add(_.sample(tags));

    for (const commentIdx of _.range(COMMENTS_PER_POST)) {
      let comment = {
        text: _.sample(COMMENT_TEXT_SAMPLES),
      };

      await postCommentsLink.add(comment);
      await (await Comments.getLink(comment, 'author')).set(_.sample(authors));
    }
  }
}

const friendIds = [];
// each user is created so his friends are previously added users
for (const idx of _.range(USERS)) {
  const id = await Users.insertAsync({
    name: `User - ${idx}`,
    friendIds,
    subordinateIds: idx === 3 ? [friendIds[2]] : [],
  });

  friendIds.push(id);
}

const project1 = await Projects.insertAsync({ name: 'Project 1' });
const project2 = await Projects.insertAsync({ name: 'Project 2' });

await Files.insertAsync({
  filename: 'test.txt',
  metas: [
    {
      type: 'text',
      projectId: project1,
    },
    {
      type: 'hidden',
      projectId: project2,
    },
  ],
  meta: {
    type: 'text',
    projectId: project1,
  },
});

await Files.insertAsync({
  filename: 'invoice.pdf',
  metas: [
    {
      type: 'pdf',
      projectId: project2,
    },
  ],
  meta: {
    type: 'pdf',
    projectId: project1,
  },
});

/**
 * Products here are slowly changing dimensions, with price being the the field which creates new version.
 * However, there are also general attributes which do not create versions, such as units & delivery.
 */
await Products.insertAsync({
  title: 'Nails',
  price: 1.5,
  productId: 1,
});
await Products.insertAsync({
  title: 'Nails',
  price: 1.6,
  productId: 1,
});
await Products.insertAsync({
  title: 'Laptop',
  price: 1500,
  productId: 2,
});
await ProductAttributes.insertAsync({
  productId: 1,
  unit: 'piece',
  delivery: 0,
});
await ProductAttributes.insertAsync({
  productId: 2,
  delivery: 10,
});

// For testing "one" relationship on product
await Products.insertAsync({
  title: 'Laptop',
  price: 1300,
  singleProductId: 1,
});

await ProductAttributes.insertAsync({
  singleProductId: 1,
  delivery: 12,
});

console.log('[ok] fixtures have been loaded.');
