import { Logger } from "@nestjs/common";
import { RbacService, PERMISSIONS } from "./src/index.js";

const logger = new Logger("RbacTest");
const rbacService = new RbacService();

// Test 1: Owner has permission to manage members
logger.log(
  "Test 1 - Owner can manage members: " + 
  rbacService.hasPermission("owner", PERMISSIONS.MEMBER_MANAGE),
); // should be true

// Test 2: Member does not have permission to manage members
logger.log(
  "Test 2 - Member can manage members: " + 
  rbacService.hasPermission("member", PERMISSIONS.MEMBER_MANAGE),
); // should be false

// Test 3: Admin can manage members
logger.log(
  "Test 3 - Admin can manage members: " + 
  rbacService.hasPermission("admin", PERMISSIONS.MEMBER_MANAGE),
); // should be true

// Test 4: Can manage member hierarchy
logger.log(
  "Test 4 - Owner can manage member: " + 
  rbacService.canManageMember("owner", "member"),
); // should be true
logger.log(
  "Test 5 - Admin can manage member: " + 
  rbacService.canManageMember("admin", "member"),
); // should be true
logger.log(
  "Test 6 - Member cannot manage admin: " + 
  rbacService.canManageMember("member", "admin"),
); // should be false
logger.log(
  "Test 7 - Admin cannot manage owner: " + 
  rbacService.canManageMember("admin", "owner"),
); // should be false

// Test 8: Get all permissions for role
logger.log(
  "Test 8 - Owner permissions count: " + 
  rbacService.getPermissionsForRole("owner").length,
); // should be 11
logger.log(
  "Test 9 - Admin permissions count: " + 
  rbacService.getPermissionsForRole("admin").length,
); // should be 9
logger.log(
  "Test 10 - Member permissions count: " + 
  rbacService.getPermissionsForRole("member").length,
); // should be 1

logger.log("\n✅ All RBAC tests completed!");
