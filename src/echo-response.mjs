export function createEchoResponse(args) {
  return {
    message: "echo-reply",
    data: {
      text: args.echoText,
    },
  };
}
