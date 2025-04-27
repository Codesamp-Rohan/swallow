# 🕊️ Swallow

**Swallow** is a **decentralized localhost browsing chat app**, built for fast, local-first conversations without relying on any centralized servers.  
It’s lightweight, peer-to-peer, and feels like magic on your local network. ✨

---

## 🚀 Features

- 🔗 **Peer-to-peer** communication over localhost
- 🌐 **Decentralized**: No servers, no middlemen
- 💬 **Real-time chat** experience
- ⚡ **Instant connections** inside your local network
- 🛡️ **Private and secure** (everything stays local)

---

## 🛠️ Installation

First, make sure you have **Holesail** installed on your system.  
(You can install it from [holesail.com](https://holesail.com) or using your preferred method.)

```bash
npm install holesail -g
```

Then:

```bash
git clone https://github.com/codesamp-rohan/swallow.git
cd swallow
cd ./frontend
npm install
cd ../backend
npm install
```

---

## 📚 Usage

follow these steps:

### 1. Start the Chat Server

Navigate to the backend folder and run the Holesail server:

```bash
cd backend
holesail --live 5173 --host localhost
```

then :

Navigate to the frontend folder and run the Holesail server:

```bash
cd frontend
holesail --live <hosting_PORT> --host <local_HOST>
```

You will get 2 keys which must be shared to others for setting up the connection.

You can also use **--connector** to add custom key

### 1. Join the Server as Client

Open your terminal and run:

```bash
cd backend
holesail --port 5173 --host localhost <backendKeySentByServer>
```

then start another terminal and run,

```bash
cd frontend
holesail <frontendKeySentByServer>
```

You will get a localhost link running, for eg :

```
http://localhost:8989
```

Congratulations, the chat connection is setup at that URL.
