import { collection } from "./db";
import webPush from "web-push";

type Subscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const subscriptionCollection = () => collection<Subscription>("subscription");

export const subscribe = (newSubscription: Subscription) => {
  return subscriptionCollection().insertOne(newSubscription);
};

export const broadcastMessage = async (message: string) => {
  const subscriptions = await subscriptionCollection().find().toArray();
  subscriptions.forEach((subscription) => {
    const options = {
      TTL: 60,
    };

    webPush.sendNotification(subscription, message, options);
  });
};
