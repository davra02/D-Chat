// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleChat {
    // Estructura de un mensaje

    struct User {
        uint id;
        string userName;
        address addr;
    }

    struct Message {
        uint id;
        address sender; // Dirección que envió el mensaje
        string senderName;
        string content; // Contenido del mensaje
        uint256 timestamp; // Marca de tiempo de cuando se envió el mensaje
    }

    struct Chat {
        uint id;
        User admin;
        User[] participants; // Participantes del chat
        Message[] messages; // Mensajes del chat
    }

    mapping(address => User) public users;
    mapping(string => bool) public usernamesTaken;
    mapping (string => address) usernameToAddress;
    mapping(address => uint[]) public userChats;



    // Arrays para almacenar chats
    Chat[] public chats;
    uint public userCount = 0;

    
    function register(string memory _username) public {
        // Comprobar si el usuario ya se ha registrado
        require(users[msg.sender].addr == address(0), "This address has already registered a username");

        // Comprobar si el nombre de usuario ya ha sido tomado
        require(!usernamesTaken[_username], "This username is already taken");

        // Registrar al usuario
        users[msg.sender] = User(userCount, _username, msg.sender);
        usernamesTaken[_username] = true;

        usernameToAddress[_username] = msg.sender;


        // Incrementar el contador de usuarios
        userCount++;
    }

    

    function createChat(address[] memory participants) public {
        // Comprobar si el remitente es un usuario registrado
        require(users[msg.sender].addr != address(0), "You must be registered to create a chat");

        // Crear el chat
        Chat storage newChat = chats[chats.length];
        newChat.id = chats.length;
        newChat.admin = users[msg.sender];

        // Añadir al remitente y a los participantes al chat
        newChat.participants.push(users[msg.sender]);
        for (uint i = 0; i < participants.length; i++) {
            require(users[participants[i]].addr != address(0), "All participants must be registered users");
            newChat.participants.push(users[participants[i]]);
        }
    }

    function leaveChat(uint chatId) public {
        Chat storage chat = chats[chatId];

        // Comprobar si el remitente es un participante en el chat
        bool isUserParticipant = false;
        uint participantIndex;
        for (uint i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].addr == msg.sender) {
                isUserParticipant = true;
                participantIndex = i;
                break;
            }
        }

        // Si el remitente no es un participante en el chat, revertir la transacción
        require(isUserParticipant, "You must be a participant in the chat to leave it");

        // Eliminar al remitente de los participantes del chat
        chat.participants[participantIndex] = chat.participants[chat.participants.length - 1];
        chat.participants.pop();

        // Eliminar el chat de los chats del remitente
        uint[] storage senderChats = userChats[msg.sender];
        for (uint i = 0; i < senderChats.length; i++) {
            if (senderChats[i] == chatId) {
                senderChats[i] = senderChats[senderChats.length - 1];
                senderChats.pop();
                break;
            }
        }
    }

    function checkRegistered() public view returns (bool) {
        return users[msg.sender].addr != address(0);
    }

    function getMyName() public view returns (string memory) {
        User storage user = users[msg.sender];
        return user.userName;
    }

    function getChatsOfUser(address user) public view returns (uint[] memory) {
        return userChats[user];
    }

    function createChatByName(string[] memory participantNames) public {
        // Comprobar si el remitente es un usuario registrado
        require(users[msg.sender].addr != address(0), "You must be registered to create a chat");

        // Crear el chat
        chats.push();
        Chat storage newChat = chats[chats.length - 1];
        newChat.id = chats.length - 1;
        newChat.admin = users[msg.sender];

        // Añadir al remitente y a los participantes al chat
        newChat.participants.push(users[msg.sender]);
        userChats[msg.sender].push(newChat.id); // Añadir el chat al array de chats del remitente
        for (uint i = 0; i < participantNames.length; i++) {
            address participantAddress = usernameToAddress[participantNames[i]];
            require(participantAddress != address(0), "All participants must be registered users");
            newChat.participants.push(users[participantAddress]);
            userChats[participantAddress].push(newChat.id); // Añadir el chat al array de chats del participante
        }
        emit ChatCreated(newChat.id, msg.sender);
    }

    function getMyChats() public view returns (Chat[] memory) {
        uint[] memory chatIds = userChats[msg.sender];
        Chat[] memory myChats = new Chat[](chatIds.length);
        for (uint i = 0; i < chatIds.length; i++) {
            myChats[i] = chats[chatIds[i]];
        }
        return myChats;
    }

    function getChatMessages(uint chatId) public view returns (Message[] memory) {
        Chat storage chat = chats[chatId];

        // Comprobar si el remitente es un participante en el chat
        bool isUserParticipant = false;
        for (uint i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].addr == msg.sender) {
                isUserParticipant = true;
                break;
            }
        }

        // Si el remitente no es un participante en el chat, revertir la transacción
        require(isUserParticipant, "You must be a participant in the chat to view its messages");

        // Devolver los mensajes del chat
        return chat.messages;
    }

    function getUserDetailsByAddr(address _address) public view returns (uint, string memory) {
        User storage user = users[_address];
        return (user.id, user.userName);
    }

    function getUserDetailsByName(string memory userName) public view returns (uint, string memory) {
        address userAddress = usernameToAddress[userName];
        require(userAddress != address(0), "User does not exist");
        User storage user = users[userAddress];
        return (user.id, user.userName);
    }

    function testConnection() public pure returns (string memory) {
        return "Connection successful";
    }


    function sendMessage(uint chatId, string memory content) public {
        Chat storage chat = chats[chatId];

        // Comprobar si el remitente es un participante en el chat
        bool isUserParticipant = false;
        for (uint i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].addr == msg.sender) {
                isUserParticipant = true;
                break;
            }
        }
        require(isUserParticipant, "You are not a participant in this chat");

        // Crear el mensaje
        Message memory newMessage;
        newMessage.id = chat.messages.length;
        newMessage.sender = msg.sender;
        newMessage.senderName = users[msg.sender].userName; // Asignar el nombre del remitente
        newMessage.content = content;
        newMessage.timestamp = block.timestamp;

        // Añadir el mensaje al chat
        chat.messages.push(newMessage);

        //Emito evento de mensaje enviado
        emit MessageSent(chatId, newMessage.id, msg.sender, newMessage.senderName, content, block.timestamp);
    }

    function isParticipant(uint chatId, address user) public view returns (bool) {
        Chat storage chat = chats[chatId];
        for (uint i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].addr == user) {
                return true;
            }
        }
        return false;
    }



    event MessageSent(uint indexed chatId, uint indexed messageId, address indexed sender, string senderName, string content, uint256 timestamp);
    event ChatCreated(uint chatId, address creator);


}
