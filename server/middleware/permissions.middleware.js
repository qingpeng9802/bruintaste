import jwtAuthz from "express-jwt-authz";

const checkPermissions = (permissions) => {
  return jwtAuthz([permissions], {
  });
};

export default checkPermissions;