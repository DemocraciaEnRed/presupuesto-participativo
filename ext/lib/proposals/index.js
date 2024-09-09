exports.isCitizenOnProposal = (user, forum) =>
  !forum.isOwner(user) && !forum.hasRole(user)

exports.isAdminOnProposal = (user, forum) =>
  forum.hasRole(user) || forum.isOwner(user)
