import React, { useState, useEffect, useRef } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import "./videocall.css";

export function VideoCall() {
  const [peerId, setPeerId] = useState("");
  const [myPeerId, setMyPeerId] = useState("");
  const [myPeer, setMyPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<MediaConnection>();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localScreenShareVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myPeer) {
      myPeer.on("open", (id) => {
        console.log(`Peer ID: ${id}`);
      });

      myPeer.on("disconnected", (x) => {
        console.log("got Disconnected ", x);
      });

      myPeer.on("close", () => {
        console.log("got closed");
      });

      myPeer.on("call", (call) => {
        setConnection(call);
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            call.answer(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
              localVideoRef.current.play();
            }
            call.on("stream", (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play();
              }
            });
          });
      });
    }
  }, [myPeer]);

  const create = (e: any) => {
    e.preventDefault();
    if (myPeer) {
      return console.log("Peer already exists");
    }
    console.log(`id: ${myPeerId}`)
    const newPeer = new Peer(myPeerId, {
      host: "localhost",
      port: 8080,
      path: "/peer",
    });
    newPeer.on("open", () => {
      console.log("Created");
    });
    setMyPeer(newPeer);
  };

  const startVideoCall = async (e: any) => {
    e.preventDefault();
    if (myPeer) {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = media;
        localVideoRef.current.play();
      }
      const call = myPeer.call(peerId, media);

      setConnection(call);

      call.on("stream", (remoteMedia) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteMedia;
          remoteVideoRef.current.play();
        }
      });

      call.on("close", () => {
        console.log("Disconnected");
      });
    }
  };

  async function startScreenSharing() {
    const media = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    if (connection) {
      connection.peerConnection
        .getSenders()[1]
        .replaceTrack(media.getVideoTracks()[0]);
    }
  }

  return (
    <div id="video-call-container">
      <div id="header">
        <h1>Chat Application</h1>
        <div id="peer-id">{myPeerId && <p>Your Peer ID: {myPeerId}</p>}</div>
      </div>

      <div id="content-container">
        <div id="left-pane">
          {!myPeer && (
            <form onSubmit={create}>
              <input
                type="text"
                id="createId"
                placeholder="Peer ID for creation"
                onChange={(e) => setMyPeerId(e.target.value)}
              />
              <button>Create</button>
            </form>
          )}
        </div>
        <div>
          <form>
            <input
              type="text"
              id="connectionId"
              placeholder="Enter Peer ID for creation"
              onChange={(e) => setPeerId(e.target.value)}
            />
            <div id="video-button">
              <button onClick={startVideoCall}>Start Video Call</button>
            </div>
          </form>
        </div>
        <div id="right-pane">
          <div id="video-container">
            <div id="local-video">
              <video ref={localVideoRef} autoPlay playsInline muted></video>
            </div>
            <div id="remote-video">
              <video ref={remoteVideoRef} autoPlay playsInline></video>
            </div>
          </div>
          <div id="screen-sharing">
            <button onClick={startScreenSharing}>Start screen sharing</button>
          </div>
        </div>
      </div>
    </div>
  );
}
