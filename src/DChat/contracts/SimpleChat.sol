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

    function checkRegistered() public view returns (bool) {
        return users[msg.sender].addr != address(0);
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
        for (uint i = 0; i < participantNames.length; i++) {
            address participantAddress = usernameToAddress[participantNames[i]];
            require(participantAddress != address(0), "All participants must be registered users");
            newChat.participants.push(users[participantAddress]);
        }
    }

    function getChatMessages(uint chatId) public view returns (Message[] memory) {
        Chat storage chat = chats[chatId];

        // Comprobar si el remitente es un participante en el chat
        bool isParticipant = false;
        for (uint i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].addr == msg.sender) {
                isParticipant = true;
                break;
            }
        }

        // Si el remitente no es un participante en el chat, revertir la transacción
        require(isParticipant, "You must be a participant in the chat to view its messages");

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
        bool isParticipant = false;
        for (uint i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].addr == msg.sender) {
                isParticipant = true;
                break;
            }
        }

        require(isParticipant, "You are not a participant in this chat");

        // Crear el mensaje
        Message memory newMessage;
        newMessage.id = chat.messages.length;
        newMessage.sender = msg.sender;
        newMessage.content = content;
        newMessage.timestamp = block.timestamp;

        // Añadir el mensaje al chat
        chat.messages.push(newMessage);
    }
    // // Evento que se emite cada vez que un mensaje es enviado
    // event MessageSent(address indexed sender, string content, uint256 timestamp);

    // // Función para enviar un mensaje
    // function sendMessage(string calldata content) external {
    //     // Crear un nuevo mensaje
    //     messages.push(Message(msg.sender, content, block.timestamp));

    //     // Emitir el evento
    //     emit MessageSent(msg.sender, content, block.timestamp);
    // }

    // // Función para obtener el total de mensajes
    // function getTotalMessages() external view returns (uint256) {
    //     return messages.length;
    // }

    // // Función para leer un mensaje específico por su índice
    // function readMessage(uint256 index) external view returns (Message memory) {
    //     require(index < messages.length, "Invalid message index");
    //     return messages[index];
    // }
}
