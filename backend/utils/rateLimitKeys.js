module.exports = {
  byIP: (req) => req.ip,

  byIPAndRoute: (req) => `${req.ip}:${req.baseUrl}${req.path}`,

  byUserOrIP: (req) =>
    req.user?.id
      ? `user:${req.user.id}`
      : `ip:${req.ip}`,
};
