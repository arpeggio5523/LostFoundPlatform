// use to find other participant in the chat
export function getOtherParticipant(participants = [], currentUserId) {
  return participants.find((participant) => String(participant._id) !== String(currentUserId));
}
