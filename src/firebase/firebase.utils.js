import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";

const config = {
  apiKey: "AIzaSyD3bwgtrbOpKycOJrQYqPnfFufljhoUwEU",
  authDomain: "petbook-2bc13.firebaseapp.com",
  databaseURL: "https://petbook-2bc13.firebaseio.com",
  projectId: "petbook-2bc13",
  storageBucket: "petbook-2bc13.appspot.com",
  messagingSenderId: "1002869522888",
  appId: "1:1002869522888:web:ea334f2cb3ab9cad1480fd",
  measurementId: "G-Y4DHCPGLE3",
};

export const getCommunities = async () => {
  const communitiesRef = firestore.collection("communities");
  const communities = (await (await communitiesRef.get()).docs).map((el) => ({
    id: el.id,
    ...el.data(),
  }));
  console.log(communities);
  return communities;
};

export const subscribeUserToCommunity = async (userId, communityId) => {
  const userRef = firestore.doc("users/" + userId);
  const userSubscriptions = (await userRef.get()).data().subscriptions;

  if (!userSubscriptions.includes(communityId)) {
    userSubscriptions.push(communityId);
    userRef.update({
      subscriptions: userSubscriptions,
    });
  }
};

export const createPostDocument = async (postTitle, communityId, image, communityName, userId, displayName) => {
    if(!userId) return;
    
    const createdAt = new Date();

    const postsRef = firestore.collection('posts');
    const postRef = postsRef.doc();

    try{
        await postRef.set({
            postTitle: postTitle,
            communityId: communityId,
            communityName: communityName,
            userId: userId,
            displayName: displayName,
            createdAt: createdAt,
            imageUrl: '',
            noComments: 0,
            comments: []
        })
    } catch (error) {
        console.log('Error while creating post document')
    }

    const imageUrl = await uploadImage(image);

    await postRef.update({
        imageUrl: imageUrl
    })
}

export const createCommunityDocument = async ({ communityName, description, topic, image },{id}) => {

    if(!id) return;
    
    const createdAt = new Date();
    const collectionRef = firestore.collection('communities');
    const communityRef = collectionRef.doc();
    try{
        await communityRef.set({
            name: communityName,
            description: description,
            topic: topic,
            createdAt: createdAt,
            propietaryId: id,
            imageUrl: '',
            members: 0
        })
    } catch (error) {
        console.log('Error while creating community document');
    }


    const imageUrl = await uploadImage(image);

    await communityRef.update({
        imageUrl: imageUrl
    })
    
}

const uploadImage = async (image) => {
    const storageRef = firestorage.ref();
    const imageRef = storageRef.child(image.name);
    await imageRef.put(image).then(() => {
        console.log("Image uploaded "+image.name);
    })
    const imageUrl = await imageRef.getDownloadURL();

    return imageUrl;
}


export const createPostDocument_i = async (postDetails) => {
  console.log(
    "%c Post details to Firestore",
    "color: orange; font-weight: bold"
  );
};

export const addCommentToPostDocument_i = async (commentDetails) => {
  console.log(
    "%c Comment details to Firestore",
    "color: orange; font-weight: bold"
  );
  console.table(commentDetails);
  console.log(commentDetails);
};

export const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;

  const userRef = firestore.doc(`users/${userAuth.uid}`);

  const snapShot = userRef.get();

  if (!(await snapShot).exists) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        subscriptions: [],
        ...additionalData,
      });
    } catch (error) {
      console.log("error al crear usuario");
    }
  }
  return userRef;
};

export const getCommunitiesFromUser = async (userId) => {
    const userRef = firestore.doc('users/'+userId);
    const userSubscriptions = (await userRef.get()).data().subscriptions;

    const communities = await getCommunities();

    var communitiesFromUser = [];

    communities.forEach(community => {
        if(userSubscriptions.includes(community.id)) {
            communitiesFromUser.push(community);
        }
    })

    return communitiesFromUser;

}

firebase.initializeApp(config);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const firestorage = firebase.storage();

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;
