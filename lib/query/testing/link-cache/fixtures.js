import {Authors, Groups, Posts, Categories, AuthorProfiles} from './collections';

const GROUPS = 3;
const CATEGORIES = 3;
const AUTHOR_PER_GROUPS = 3;
const POSTS_PER_AUTHOR = 3;

export let categoryIds = [];
export let groupIds = [];
export let authorIds = [];
export let postIds = [];

export default function createFixtures() {
    for (let i = 0; i < CATEGORIES; i++) {
        const categoryId = Categories.insert({
            name: `Category ${i}`
        });

        categoryIds.push(categoryId);
    }


    for (let i = 0; i < GROUPS; i++) {
        const groupId = Groups.insert({
            name: `Group ${i}`
        });

        groupIds.push(groupId);
    }

    groupIds.forEach(groupId => {
        for (let i = 0; i < AUTHOR_PER_GROUPS; i++) {
            const authorId = Authors.insert({
                name: `Author ${authorIds.length}`,
                createdAt: new Date(),
            });

            const authorProfileId = AuthorProfiles.insert({
                name: `Author ${authorIds.length}`,
                createdAt: new Date(),
            });

            Authors.getLink(authorId, 'profile').set(authorProfileId);

            authorIds.push(authorId);

            // link it to the group
            const groupLink = Authors.getLink(authorId, 'groups');
            groupLink.add(groupId);

            for (let j = 0; j < POSTS_PER_AUTHOR; j++) {
                createPost(authorId);
            }
        }
    });
}

function createPost(authorId) {
    const postId = Posts.insert({
        title: `Post ${postIds.length}`,
        createdAt: new Date(),
    });

    postIds.push(postId);

    const authorLink = Posts.getLink(postId, 'author');
    authorLink.set(authorId);

    const randomCategoryId = categoryIds[Math.floor(Math.random()*categoryIds.length)];

    const categoriesLink = Posts.getLink(postId, 'categories');
    categoriesLink.add(randomCategoryId, {
        createdAt: new Date(),
    });

    return postId;
}
