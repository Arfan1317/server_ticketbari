'use strict';

// src/plugins/organization/access/access.ts
function createAccessControl(s) {
  return {
    newRole(statements2) {
      return role(statements2);
    }
  };
}
function role(statements) {
  return {
    statements,
    authorize(request, connector) {
      for (const [requestedResource, requestedActions] of Object.entries(
        request
      )) {
        const allowedActions = statements[requestedResource];
        if (!allowedActions) {
          return {
            success: false,
            error: `You are not allowed to access resource: ${requestedResource}`
          };
        }
        const success = connector === "OR" ? requestedActions.some(
          (requestedAction) => allowedActions.includes(requestedAction)
        ) : requestedActions.every(
          (requestedAction) => allowedActions.includes(requestedAction)
        );
        if (success) {
          return { success: true };
        }
        return {
          success: false,
          error: `Unauthorized to access resource "${requestedResource}"`
        };
      }
      return {
        success: false,
        error: "Not authorized"
      };
    }
  };
}

// src/plugins/organization/access/statement.ts
var defaultStatements = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"]
};
var defaultAc = createAccessControl();
var adminAc = defaultAc.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"]
});
var ownerAc = defaultAc.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"]
});
var memberAc = defaultAc.newRole({
  organization: [],
  member: [],
  invitation: []
});
var defaultRoles = {
  admin: adminAc,
  owner: ownerAc,
  member: memberAc
};

exports.adminAc = adminAc;
exports.createAccessControl = createAccessControl;
exports.defaultAc = defaultAc;
exports.defaultRoles = defaultRoles;
exports.defaultStatements = defaultStatements;
exports.memberAc = memberAc;
exports.ownerAc = ownerAc;
exports.role = role;
