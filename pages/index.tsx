import Head from "next/head";
import { useState } from "react";
import styles from "../styles/Home.module.css";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubscribeClick() {
    const status = await Notification.requestPermission();
    if (status !== "granted") {
      return;
    }
    setSubscribed(true);

    const { publicKey } = await fetch("/api/vapid").then((response) =>
      response.json()
    );
    const convertedPublicKey = urlBase64ToUint8Array(publicKey);

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedPublicKey,
    });
    const { keys } = subscription.toJSON();

    await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys,
      }),
    });
    // POST subscription.endpoint to server
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
      </Head>

      <main className={styles.main}>
        <button disabled={subscribed} onClick={handleSubscribeClick}>
          Subscribe
        </button>
      </main>
    </div>
  );
}
