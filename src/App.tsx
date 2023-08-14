import React, { useState, useEffect } from "react";
import Peer, { DataConnection } from 'peerjs';
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

interface Message {
  from: 'self' | 'other';
  text: string;
}

const App: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [peer, setPeer] = useState<Peer | null>(null);
  const [remoteId, setRemoteId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [conn, setConn] = useState<DataConnection | null>(null);

  useEffect(() => {
    const peer = new Peer();
    setPeer(peer);

    peer.on("open", (id: string) => {
      setId(id);
    });

    peer.on("connection", (connection: DataConnection) => {
      setConn(connection);
      connection.on("data", (data: any) => {
        setMessages(prevMessages => [...prevMessages, {from: 'other', text: data}]);
      });
    });

  }, []);

  const sendMessage = (): void => {
    if (conn) {
      conn.send(inputValue);
      setMessages(prevMessages => [...prevMessages, {from: 'self', text: inputValue}]);
      setInputValue("");
    }
  };

  const connectToPeer = (): void => {
    if (peer) {
      const connection = peer.connect(remoteId);
      setConn(connection);
      connection.on("open", () => {
        connection.on("data", (data: any) => {
          setMessages(prevMessages => [...prevMessages, {from: 'other', text: data}]);
        });
      });
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="rounded shadow p-6 max-w-lg w-full">
        <h2 className="text-xl mb-4">Your ID: <span className="font-semibold">{id}</span></h2>
        <div className="mb-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
          <Input value={remoteId} onChange={e => setRemoteId(e.target.value)} type="text" placeholder="Enter remote peer ID" />
          <Button onClick={connectToPeer}>Connect</Button>
    </div>
        </div>
        <div className="mb-4 overflow-y-auto h-40 border rounded p-2">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 p-2 rounded ${message.from === 'self' ? 'text-right ml-auto' : ''}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="flex">
          <Input
            className="flex-grow border rounded p-2 mr-2"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type a message..."
          />
          <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none" onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </main>
  );
}

export default App;
