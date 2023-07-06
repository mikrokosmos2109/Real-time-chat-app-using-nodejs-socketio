import moment from "moment";

const messageFormatter = (username, text) => {
  const formattedTime = moment().format("h:mm a");
  const usernameWidth = 15; 
  const formattedUsername = username.padEnd(usernameWidth);

  return {
    username: formattedUsername,
    text,
    time: formattedTime,
  };
};

export default messageFormatter;


