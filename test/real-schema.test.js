'use strict'

const { test } = require('node:test')
const helper = require('./helper')
const { buildFederatedInfo } = require('../lib/federate')

// TODO move to "graphql-strapi-federated"

const strapiSchema = `
"""
The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
"""
scalar JSON @specifiedBy(url: "http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf")

"""
A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the date-time format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
"""
scalar DateTime

"""The Upload scalar type represents a file upload."""
scalar Upload

type Pagination {
  total: Int!
  page: Int!
  pageSize: Int!
  pageCount: Int!
}

type ResponseCollectionMeta {
  pagination: Pagination!
}

enum PublicationState {
  LIVE
  PREVIEW
}

input IDFilterInput {
  and: [ID]
  or: [ID]
  not: IDFilterInput
  eq: ID
  ne: ID
  startsWith: ID
  endsWith: ID
  contains: ID
  notContains: ID
  containsi: ID
  notContainsi: ID
  gt: ID
  gte: ID
  lt: ID
  lte: ID
  null: Boolean
  notNull: Boolean
  in: [ID]
  notIn: [ID]
  between: [ID]
}

input BooleanFilterInput {
  and: [Boolean]
  or: [Boolean]
  not: BooleanFilterInput
  eq: Boolean
  ne: Boolean
  startsWith: Boolean
  endsWith: Boolean
  contains: Boolean
  notContains: Boolean
  containsi: Boolean
  notContainsi: Boolean
  gt: Boolean
  gte: Boolean
  lt: Boolean
  lte: Boolean
  null: Boolean
  notNull: Boolean
  in: [Boolean]
  notIn: [Boolean]
  between: [Boolean]
}

input StringFilterInput {
  and: [String]
  or: [String]
  not: StringFilterInput
  eq: String
  ne: String
  startsWith: String
  endsWith: String
  contains: String
  notContains: String
  containsi: String
  notContainsi: String
  gt: String
  gte: String
  lt: String
  lte: String
  null: Boolean
  notNull: Boolean
  in: [String]
  notIn: [String]
  between: [String]
}

input IntFilterInput {
  and: [Int]
  or: [Int]
  not: IntFilterInput
  eq: Int
  ne: Int
  startsWith: Int
  endsWith: Int
  contains: Int
  notContains: Int
  containsi: Int
  notContainsi: Int
  gt: Int
  gte: Int
  lt: Int
  lte: Int
  null: Boolean
  notNull: Boolean
  in: [Int]
  notIn: [Int]
  between: [Int]
}

input FloatFilterInput {
  and: [Float]
  or: [Float]
  not: FloatFilterInput
  eq: Float
  ne: Float
  startsWith: Float
  endsWith: Float
  contains: Float
  notContains: Float
  containsi: Float
  notContainsi: Float
  gt: Float
  gte: Float
  lt: Float
  lte: Float
  null: Boolean
  notNull: Boolean
  in: [Float]
  notIn: [Float]
  between: [Float]
}

input DateTimeFilterInput {
  and: [DateTime]
  or: [DateTime]
  not: DateTimeFilterInput
  eq: DateTime
  ne: DateTime
  startsWith: DateTime
  endsWith: DateTime
  contains: DateTime
  notContains: DateTime
  containsi: DateTime
  notContainsi: DateTime
  gt: DateTime
  gte: DateTime
  lt: DateTime
  lte: DateTime
  null: Boolean
  notNull: Boolean
  in: [DateTime]
  notIn: [DateTime]
  between: [DateTime]
}

input JSONFilterInput {
  and: [JSON]
  or: [JSON]
  not: JSONFilterInput
  eq: JSON
  ne: JSON
  startsWith: JSON
  endsWith: JSON
  contains: JSON
  notContains: JSON
  containsi: JSON
  notContainsi: JSON
  gt: JSON
  gte: JSON
  lt: JSON
  lte: JSON
  null: Boolean
  notNull: Boolean
  in: [JSON]
  notIn: [JSON]
  between: [JSON]
}

input UploadFileFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  alternativeText: StringFilterInput
  caption: StringFilterInput
  width: IntFilterInput
  height: IntFilterInput
  formats: JSONFilterInput
  hash: StringFilterInput
  ext: StringFilterInput
  mime: StringFilterInput
  size: FloatFilterInput
  url: StringFilterInput
  previewUrl: StringFilterInput
  provider: StringFilterInput
  provider_metadata: JSONFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UploadFileFiltersInput]
  or: [UploadFileFiltersInput]
  not: UploadFileFiltersInput
}

input UploadFileInput {
  name: String
  alternativeText: String
  caption: String
  width: Int
  height: Int
  formats: JSON
  hash: String
  ext: String
  mime: String
  size: Float
  url: String
  previewUrl: String
  provider: String
  provider_metadata: JSON
}

type UploadFile {
  name: String!
  alternativeText: String
  caption: String
  width: Int
  height: Int
  formats: JSON
  hash: String!
  ext: String
  mime: String!
  size: Float!
  url: String!
  previewUrl: String
  provider: String!
  provider_metadata: JSON
  related: [GenericMorph]
  createdAt: DateTime
  updatedAt: DateTime
}

type UploadFileEntity {
  id: ID
  attributes: UploadFile
}

type UploadFileEntityResponse {
  data: UploadFileEntity
}

type UploadFileEntityResponseCollection {
  data: [UploadFileEntity!]!
  meta: ResponseCollectionMeta!
}

input I18NLocaleFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  code: StringFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [I18NLocaleFiltersInput]
  or: [I18NLocaleFiltersInput]
  not: I18NLocaleFiltersInput
}

type I18NLocale {
  name: String
  code: String
  createdAt: DateTime
  updatedAt: DateTime
}

type I18NLocaleEntity {
  id: ID
  attributes: I18NLocale
}

type I18NLocaleEntityResponse {
  data: I18NLocaleEntity
}

type I18NLocaleEntityResponseCollection {
  data: [I18NLocaleEntity!]!
  meta: ResponseCollectionMeta!
}

input UsersPermissionsPermissionFiltersInput {
  id: IDFilterInput
  action: StringFilterInput
  role: UsersPermissionsRoleFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UsersPermissionsPermissionFiltersInput]
  or: [UsersPermissionsPermissionFiltersInput]
  not: UsersPermissionsPermissionFiltersInput
}

type UsersPermissionsPermission {
  action: String!
  role: UsersPermissionsRoleEntityResponse
  createdAt: DateTime
  updatedAt: DateTime
}

type UsersPermissionsPermissionEntity {
  id: ID
  attributes: UsersPermissionsPermission
}

type UsersPermissionsPermissionRelationResponseCollection {
  data: [UsersPermissionsPermissionEntity!]!
}

input UsersPermissionsRoleFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  description: StringFilterInput
  type: StringFilterInput
  permissions: UsersPermissionsPermissionFiltersInput
  users: UsersPermissionsUserFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UsersPermissionsRoleFiltersInput]
  or: [UsersPermissionsRoleFiltersInput]
  not: UsersPermissionsRoleFiltersInput
}

input UsersPermissionsRoleInput {
  name: String
  description: String
  type: String
  permissions: [ID]
  users: [ID]
}

type UsersPermissionsRole {
  name: String!
  description: String
  type: String
  permissions(filters: UsersPermissionsPermissionFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsPermissionRelationResponseCollection
  users(filters: UsersPermissionsUserFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsUserRelationResponseCollection
  createdAt: DateTime
  updatedAt: DateTime
}

type UsersPermissionsRoleEntity {
  id: ID
  attributes: UsersPermissionsRole
}

type UsersPermissionsRoleEntityResponse {
  data: UsersPermissionsRoleEntity
}

type UsersPermissionsRoleEntityResponseCollection {
  data: [UsersPermissionsRoleEntity!]!
  meta: ResponseCollectionMeta!
}

input UsersPermissionsUserFiltersInput {
  id: IDFilterInput
  username: StringFilterInput
  email: StringFilterInput
  provider: StringFilterInput
  password: StringFilterInput
  resetPasswordToken: StringFilterInput
  confirmationToken: StringFilterInput
  confirmed: BooleanFilterInput
  blocked: BooleanFilterInput
  role: UsersPermissionsRoleFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UsersPermissionsUserFiltersInput]
  or: [UsersPermissionsUserFiltersInput]
  not: UsersPermissionsUserFiltersInput
}

input UsersPermissionsUserInput {
  username: String
  email: String
  provider: String
  password: String
  resetPasswordToken: String
  confirmationToken: String
  confirmed: Boolean
  blocked: Boolean
  role: ID
}

type UsersPermissionsUser {
  username: String!
  email: String!
  provider: String
  confirmed: Boolean
  blocked: Boolean
  role: UsersPermissionsRoleEntityResponse
  createdAt: DateTime
  updatedAt: DateTime
}

type UsersPermissionsUserEntity {
  id: ID
  attributes: UsersPermissionsUser
}

type UsersPermissionsUserEntityResponse {
  data: UsersPermissionsUserEntity
}

type UsersPermissionsUserEntityResponseCollection {
  data: [UsersPermissionsUserEntity!]!
  meta: ResponseCollectionMeta!
}

type UsersPermissionsUserRelationResponseCollection {
  data: [UsersPermissionsUserEntity!]!
}

input CategoryFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  restaurants: RestaurantFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  publishedAt: DateTimeFilterInput
  and: [CategoryFiltersInput]
  or: [CategoryFiltersInput]
  not: CategoryFiltersInput
}

input CategoryInput {
  name: String
  restaurants: [ID]
  publishedAt: DateTime
}

type Category {
  name: String!
  restaurants(filters: RestaurantFiltersInput, pagination: PaginationArg = {}, sort: [String] = [], publicationState: PublicationState = LIVE): RestaurantRelationResponseCollection
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}

type CategoryEntity {
  id: ID
  attributes: Category
}

type CategoryEntityResponse {
  data: CategoryEntity
}

type CategoryEntityResponseCollection {
  data: [CategoryEntity!]!
  meta: ResponseCollectionMeta!
}

type CategoryRelationResponseCollection {
  data: [CategoryEntity!]!
}

input RestaurantFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  description: StringFilterInput
  categories: CategoryFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  publishedAt: DateTimeFilterInput
  and: [RestaurantFiltersInput]
  or: [RestaurantFiltersInput]
  not: RestaurantFiltersInput
}

input RestaurantInput {
  name: String
  description: String
  categories: [ID]
  publishedAt: DateTime
}

type Restaurant {
  name: String!
  description: String
  categories (filters: CategoryFiltersInput, pagination: PaginationArg, sort: [String], publicationState: PublicationState): CategoryRelationResponseCollection
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}

type RestaurantEntity {
  id: ID
  attributes: Restaurant
}

type RestaurantEntityResponse {
  data: RestaurantEntity
}

type RestaurantEntityResponseCollection {
  data: [RestaurantEntity!]!
  meta: ResponseCollectionMeta!
}

type RestaurantRelationResponseCollection {
  data: [RestaurantEntity!]!
}

union GenericMorph = UploadFile | I18NLocale | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser | Category | Restaurant

input FileInfoInput {
  name: String
  alternativeText: String
  caption: String
}

type UsersPermissionsMe {
  id: ID!
  username: String!
  email: String
  confirmed: Boolean
  blocked: Boolean
  role: UsersPermissionsMeRole
}

type UsersPermissionsMeRole {
  id: ID!
  name: String!
  description: String
  type: String
}

input UsersPermissionsRegisterInput {
  username: String!
  email: String!
  password: String!
}

input UsersPermissionsLoginInput {
  identifier: String!
  password: String!
  provider: String! = "local"
}

type UsersPermissionsPasswordPayload {
  ok: Boolean!
}

type UsersPermissionsLoginPayload {
  jwt: String
  user: UsersPermissionsMe!
}

type UsersPermissionsCreateRolePayload {
  ok: Boolean!
}

type UsersPermissionsUpdateRolePayload {
  ok: Boolean!
}

type UsersPermissionsDeleteRolePayload {
  ok: Boolean!
}

input PaginationArg {
  page: Int
  pageSize: Int
  start: Int
  limit: Int
}

type Query {
  uploadFile(id: ID): UploadFileEntityResponse
  uploadFiles(filters: UploadFileFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UploadFileEntityResponseCollection
  i18NLocale(id: ID): I18NLocaleEntityResponse
  i18NLocales(filters: I18NLocaleFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): I18NLocaleEntityResponseCollection
  usersPermissionsRole(id: ID): UsersPermissionsRoleEntityResponse
  usersPermissionsRoles(filters: UsersPermissionsRoleFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsRoleEntityResponseCollection
  usersPermissionsUser(id: ID): UsersPermissionsUserEntityResponse
  usersPermissionsUsers(filters: UsersPermissionsUserFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsUserEntityResponseCollection
  category(id: ID): CategoryEntityResponse
  categories(filters: CategoryFiltersInput, pagination: PaginationArg = {}, sort: [String] = [], publicationState: PublicationState = LIVE): CategoryEntityResponseCollection
  restaurant(id: ID): RestaurantEntityResponse
  restaurants(filters: RestaurantFiltersInput, pagination: PaginationArg = {}, sort: [String] = [], publicationState: PublicationState = LIVE): RestaurantEntityResponseCollection
  me: UsersPermissionsMe
}

type Mutation {
  createUploadFile(data: UploadFileInput!): UploadFileEntityResponse
  updateUploadFile(id: ID!, data: UploadFileInput!): UploadFileEntityResponse
  deleteUploadFile(id: ID!): UploadFileEntityResponse
  createCategory(data: CategoryInput!): CategoryEntityResponse
  updateCategory(id: ID!, data: CategoryInput!): CategoryEntityResponse
  deleteCategory(id: ID!): CategoryEntityResponse
  createRestaurant(data: RestaurantInput!): RestaurantEntityResponse
  updateRestaurant(id: ID!, data: RestaurantInput!): RestaurantEntityResponse
  deleteRestaurant(id: ID!): RestaurantEntityResponse
  upload(refId: ID, ref: String, field: String, info: FileInfoInput, file: Upload!): UploadFileEntityResponse!
  multipleUpload(refId: ID, ref: String, field: String, files: [Upload]!): [UploadFileEntityResponse]!
  updateFileInfo(id: ID!, info: FileInfoInput): UploadFileEntityResponse!
  removeFile(id: ID!): UploadFileEntityResponse

  """Create a new role"""
  createUsersPermissionsRole(data: UsersPermissionsRoleInput!): UsersPermissionsCreateRolePayload

  """Update an existing role"""
  updateUsersPermissionsRole(id: ID!, data: UsersPermissionsRoleInput!): UsersPermissionsUpdateRolePayload

  """Delete an existing role"""
  deleteUsersPermissionsRole(id: ID!): UsersPermissionsDeleteRolePayload

  """Create a new user"""
  createUsersPermissionsUser(data: UsersPermissionsUserInput!): UsersPermissionsUserEntityResponse!

  """Update an existing user"""
  updateUsersPermissionsUser(id: ID!, data: UsersPermissionsUserInput!): UsersPermissionsUserEntityResponse!

  """Update an existing user"""
  deleteUsersPermissionsUser(id: ID!): UsersPermissionsUserEntityResponse!
  login(input: UsersPermissionsLoginInput!): UsersPermissionsLoginPayload!

  """Register a user"""
  register(input: UsersPermissionsRegisterInput!): UsersPermissionsLoginPayload!

  """Request a reset password token"""
  forgotPassword(email: String!): UsersPermissionsPasswordPayload

  """
  Reset user password. Confirm with a code (resetToken from forgotPassword)
  """
  resetPassword(password: String!, passwordConfirmation: String!, code: String!): UsersPermissionsLoginPayload

  """Confirm an email users email address"""
  emailConfirmation(confirmation: String!): UsersPermissionsLoginPayload
}
`

const strapiSchemaFederated = `scalar JSON @specifiedBy (url: "http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf") 
scalar DateTime
scalar Upload
type Pagination @key(fields: "total") {
  total: Int!
  page: Int!
  pageSize: Int!
  pageCount: Int!
}
type ResponseCollectionMeta @key(fields: "pagination { total }") {
  pagination: Pagination!
}
enum PublicationState {
  LIVE
  PREVIEW
}
input IDFilterInput {
  and: [ID]
  or: [ID]
  not: IDFilterInput
  eq: ID
  ne: ID
  startsWith: ID
  endsWith: ID
  contains: ID
  notContains: ID
  containsi: ID
  notContainsi: ID
  gt: ID
  gte: ID
  lt: ID
  lte: ID
  null: Boolean
  notNull: Boolean
  in: [ID]
  notIn: [ID]
  between: [ID]
}
input BooleanFilterInput {
  and: [Boolean]
  or: [Boolean]
  not: BooleanFilterInput
  eq: Boolean
  ne: Boolean
  startsWith: Boolean
  endsWith: Boolean
  contains: Boolean
  notContains: Boolean
  containsi: Boolean
  notContainsi: Boolean
  gt: Boolean
  gte: Boolean
  lt: Boolean
  lte: Boolean
  null: Boolean
  notNull: Boolean
  in: [Boolean]
  notIn: [Boolean]
  between: [Boolean]
}
input StringFilterInput {
  and: [String]
  or: [String]
  not: StringFilterInput
  eq: String
  ne: String
  startsWith: String
  endsWith: String
  contains: String
  notContains: String
  containsi: String
  notContainsi: String
  gt: String
  gte: String
  lt: String
  lte: String
  null: Boolean
  notNull: Boolean
  in: [String]
  notIn: [String]
  between: [String]
}
input IntFilterInput {
  and: [Int]
  or: [Int]
  not: IntFilterInput
  eq: Int
  ne: Int
  startsWith: Int
  endsWith: Int
  contains: Int
  notContains: Int
  containsi: Int
  notContainsi: Int
  gt: Int
  gte: Int
  lt: Int
  lte: Int
  null: Boolean
  notNull: Boolean
  in: [Int]
  notIn: [Int]
  between: [Int]
}
input FloatFilterInput {
  and: [Float]
  or: [Float]
  not: FloatFilterInput
  eq: Float
  ne: Float
  startsWith: Float
  endsWith: Float
  contains: Float
  notContains: Float
  containsi: Float
  notContainsi: Float
  gt: Float
  gte: Float
  lt: Float
  lte: Float
  null: Boolean
  notNull: Boolean
  in: [Float]
  notIn: [Float]
  between: [Float]
}
input DateTimeFilterInput {
  and: [DateTime]
  or: [DateTime]
  not: DateTimeFilterInput
  eq: DateTime
  ne: DateTime
  startsWith: DateTime
  endsWith: DateTime
  contains: DateTime
  notContains: DateTime
  containsi: DateTime
  notContainsi: DateTime
  gt: DateTime
  gte: DateTime
  lt: DateTime
  lte: DateTime
  null: Boolean
  notNull: Boolean
  in: [DateTime]
  notIn: [DateTime]
  between: [DateTime]
}
input JSONFilterInput {
  and: [JSON]
  or: [JSON]
  not: JSONFilterInput
  eq: JSON
  ne: JSON
  startsWith: JSON
  endsWith: JSON
  contains: JSON
  notContains: JSON
  containsi: JSON
  notContainsi: JSON
  gt: JSON
  gte: JSON
  lt: JSON
  lte: JSON
  null: Boolean
  notNull: Boolean
  in: [JSON]
  notIn: [JSON]
  between: [JSON]
}
input UploadFileFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  alternativeText: StringFilterInput
  caption: StringFilterInput
  width: IntFilterInput
  height: IntFilterInput
  formats: JSONFilterInput
  hash: StringFilterInput
  ext: StringFilterInput
  mime: StringFilterInput
  size: FloatFilterInput
  url: StringFilterInput
  previewUrl: StringFilterInput
  provider: StringFilterInput
  provider_metadata: JSONFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UploadFileFiltersInput]
  or: [UploadFileFiltersInput]
  not: UploadFileFiltersInput
}
input UploadFileInput {
  name: String
  alternativeText: String
  caption: String
  width: Int
  height: Int
  formats: JSON
  hash: String
  ext: String
  mime: String
  size: Float
  url: String
  previewUrl: String
  provider: String
  provider_metadata: JSON
}
type UploadFile @key(fields: "name") {
  name: String!
  alternativeText: String
  caption: String
  width: Int
  height: Int
  formats: JSON
  hash: String!
  ext: String
  mime: String!
  size: Float!
  url: String!
  previewUrl: String
  provider: String!
  provider_metadata: JSON
  related: [GenericMorph]
  createdAt: DateTime
  updatedAt: DateTime
}
type UploadFileEntity @key(fields: "id") {
  id: ID
  attributes: UploadFile
}
type UploadFileEntityResponse @key(fields: "data { id }") {
  data: UploadFileEntity
}
type UploadFileEntityResponseCollection @key(fields: "meta { pagination { total } }") {
  data: [UploadFileEntity!]!
  meta: ResponseCollectionMeta!
}
input I18NLocaleFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  code: StringFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [I18NLocaleFiltersInput]
  or: [I18NLocaleFiltersInput]
  not: I18NLocaleFiltersInput
}
type I18NLocale @key(fields: "name") {
  name: String
  code: String
  createdAt: DateTime
  updatedAt: DateTime
}
type I18NLocaleEntity @key(fields: "id") {
  id: ID
  attributes: I18NLocale
}
type I18NLocaleEntityResponse @key(fields: "data { id }") {
  data: I18NLocaleEntity
}
type I18NLocaleEntityResponseCollection @key(fields: "meta { pagination { total } }") {
  data: [I18NLocaleEntity!]!
  meta: ResponseCollectionMeta!
}
input UsersPermissionsPermissionFiltersInput {
  id: IDFilterInput
  action: StringFilterInput
  role: UsersPermissionsRoleFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UsersPermissionsPermissionFiltersInput]
  or: [UsersPermissionsPermissionFiltersInput]
  not: UsersPermissionsPermissionFiltersInput
}
type UsersPermissionsPermission @key(fields: "action") {
  action: String!
  role: UsersPermissionsRoleEntityResponse
  createdAt: DateTime
  updatedAt: DateTime
}
type UsersPermissionsPermissionEntity @key(fields: "id") {
  id: ID
  attributes: UsersPermissionsPermission
}
type UsersPermissionsPermissionRelationResponseCollection @key(fields: "data") {
  data: [UsersPermissionsPermissionEntity!]!
}
input UsersPermissionsRoleFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  description: StringFilterInput
  type: StringFilterInput
  permissions: UsersPermissionsPermissionFiltersInput
  users: UsersPermissionsUserFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UsersPermissionsRoleFiltersInput]
  or: [UsersPermissionsRoleFiltersInput]
  not: UsersPermissionsRoleFiltersInput
}
input UsersPermissionsRoleInput {
  name: String
  description: String
  type: String
  permissions: [ID]
  users: [ID]
}
type UsersPermissionsRole @key(fields: "name") {
  name: String!
  description: String
  type: String
  permissions (filters: UsersPermissionsPermissionFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsPermissionRelationResponseCollection
  users (filters: UsersPermissionsUserFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsUserRelationResponseCollection
  createdAt: DateTime
  updatedAt: DateTime
}
type UsersPermissionsRoleEntity @key(fields: "id") {
  id: ID
  attributes: UsersPermissionsRole
}
type UsersPermissionsRoleEntityResponse @key(fields: "data { id }") {
  data: UsersPermissionsRoleEntity
}
type UsersPermissionsRoleEntityResponseCollection @key(fields: "meta { pagination { total } }") {
  data: [UsersPermissionsRoleEntity!]!
  meta: ResponseCollectionMeta!
}
input UsersPermissionsUserFiltersInput {
  id: IDFilterInput
  username: StringFilterInput
  email: StringFilterInput
  provider: StringFilterInput
  password: StringFilterInput
  resetPasswordToken: StringFilterInput
  confirmationToken: StringFilterInput
  confirmed: BooleanFilterInput
  blocked: BooleanFilterInput
  role: UsersPermissionsRoleFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  and: [UsersPermissionsUserFiltersInput]
  or: [UsersPermissionsUserFiltersInput]
  not: UsersPermissionsUserFiltersInput
}
input UsersPermissionsUserInput {
  username: String
  email: String
  provider: String
  password: String
  resetPasswordToken: String
  confirmationToken: String
  confirmed: Boolean
  blocked: Boolean
  role: ID
}
type UsersPermissionsUser @key(fields: "username") {
  username: String!
  email: String!
  provider: String
  confirmed: Boolean
  blocked: Boolean
  role: UsersPermissionsRoleEntityResponse
  createdAt: DateTime
  updatedAt: DateTime
}
type UsersPermissionsUserEntity @key(fields: "id") {
  id: ID
  attributes: UsersPermissionsUser
}
type UsersPermissionsUserEntityResponse @key(fields: "data { id }") {
  data: UsersPermissionsUserEntity
}
type UsersPermissionsUserEntityResponseCollection @key(fields: "meta { pagination { total } }") {
  data: [UsersPermissionsUserEntity!]!
  meta: ResponseCollectionMeta!
}
type UsersPermissionsUserRelationResponseCollection @key(fields: "data") {
  data: [UsersPermissionsUserEntity!]!
}
input CategoryFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  restaurants: RestaurantFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  publishedAt: DateTimeFilterInput
  and: [CategoryFiltersInput]
  or: [CategoryFiltersInput]
  not: CategoryFiltersInput
}
input CategoryInput {
  name: String
  restaurants: [ID]
  publishedAt: DateTime
}
type Category @key(fields: "name") {
  name: String!
  restaurants (filters: RestaurantFiltersInput, pagination: PaginationArg = {}, sort: [String] = [], publicationState: PublicationState = LIVE): RestaurantRelationResponseCollection
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}
type CategoryEntity @key(fields: "id") {
  id: ID
  attributes: Category
}
type CategoryEntityResponse @key(fields: "data { id }") {
  data: CategoryEntity
}
type CategoryEntityResponseCollection @key(fields: "meta { pagination { total } }") {
  data: [CategoryEntity!]!
  meta: ResponseCollectionMeta!
}
type CategoryRelationResponseCollection @key(fields: "data") {
  data: [CategoryEntity!]!
}
input RestaurantFiltersInput {
  id: IDFilterInput
  name: StringFilterInput
  description: StringFilterInput
  categories: CategoryFiltersInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  publishedAt: DateTimeFilterInput
  and: [RestaurantFiltersInput]
  or: [RestaurantFiltersInput]
  not: RestaurantFiltersInput
}
input RestaurantInput {
  name: String
  description: String
  categories: [ID]
  publishedAt: DateTime
}
type Restaurant @key(fields: "name") {
  name: String!
  description: String
  categories (filters: CategoryFiltersInput, pagination: PaginationArg, sort: [String], publicationState: PublicationState): CategoryRelationResponseCollection
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}
type RestaurantEntity @key(fields: "id") {
  id: ID
  attributes: Restaurant
}
type RestaurantEntityResponse @key(fields: "data { id }") {
  data: RestaurantEntity
}
type RestaurantEntityResponseCollection @key(fields: "meta { pagination { total } }") {
  data: [RestaurantEntity!]!
  meta: ResponseCollectionMeta!
}
type RestaurantRelationResponseCollection @key(fields: "data") {
  data: [RestaurantEntity!]!
}
union GenericMorph =
UploadFile | I18NLocale | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser | Category | Restaurant
input FileInfoInput {
  name: String
  alternativeText: String
  caption: String
}
type UsersPermissionsMe @key(fields: "id") {
  id: ID!
  username: String!
  email: String
  confirmed: Boolean
  blocked: Boolean
  role: UsersPermissionsMeRole
}
type UsersPermissionsMeRole @key(fields: "id") {
  id: ID!
  name: String!
  description: String
  type: String
}
input UsersPermissionsRegisterInput {
  username: String!
  email: String!
  password: String!
}
input UsersPermissionsLoginInput {
  identifier: String!
  password: String!
  provider: String! = "local"
}
type UsersPermissionsPasswordPayload @key(fields: "ok") {
  ok: Boolean!
}
type UsersPermissionsLoginPayload @key(fields: "jwt") {
  jwt: String
  user: UsersPermissionsMe!
}
type UsersPermissionsCreateRolePayload @key(fields: "ok") {
  ok: Boolean!
}
type UsersPermissionsUpdateRolePayload @key(fields: "ok") {
  ok: Boolean!
}
type UsersPermissionsDeleteRolePayload @key(fields: "ok") {
  ok: Boolean!
}
input PaginationArg {
  page: Int
  pageSize: Int
  start: Int
  limit: Int
}
extend type Query {
  uploadFile (id: ID): UploadFileEntityResponse
  uploadFiles (filters: UploadFileFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UploadFileEntityResponseCollection
  i18NLocale (id: ID): I18NLocaleEntityResponse
  i18NLocales (filters: I18NLocaleFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): I18NLocaleEntityResponseCollection
  usersPermissionsRole (id: ID): UsersPermissionsRoleEntityResponse
  usersPermissionsRoles (filters: UsersPermissionsRoleFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsRoleEntityResponseCollection
  usersPermissionsUser (id: ID): UsersPermissionsUserEntityResponse
  usersPermissionsUsers (filters: UsersPermissionsUserFiltersInput, pagination: PaginationArg = {}, sort: [String] = []): UsersPermissionsUserEntityResponseCollection
  category (id: ID): CategoryEntityResponse
  categories (filters: CategoryFiltersInput, pagination: PaginationArg = {}, sort: [String] = [], publicationState: PublicationState = LIVE): CategoryEntityResponseCollection
  restaurant (id: ID): RestaurantEntityResponse
  restaurants (filters: RestaurantFiltersInput, pagination: PaginationArg = {}, sort: [String] = [], publicationState: PublicationState = LIVE): RestaurantEntityResponseCollection
  me: UsersPermissionsMe
}
extend type Mutation {
  createUploadFile (data: UploadFileInput!): UploadFileEntityResponse
  updateUploadFile (id: ID!, data: UploadFileInput!): UploadFileEntityResponse
  deleteUploadFile (id: ID!): UploadFileEntityResponse
  createCategory (data: CategoryInput!): CategoryEntityResponse
  updateCategory (id: ID!, data: CategoryInput!): CategoryEntityResponse
  deleteCategory (id: ID!): CategoryEntityResponse
  createRestaurant (data: RestaurantInput!): RestaurantEntityResponse
  updateRestaurant (id: ID!, data: RestaurantInput!): RestaurantEntityResponse
  deleteRestaurant (id: ID!): RestaurantEntityResponse
  upload (refId: ID, ref: String, field: String, info: FileInfoInput, file: Upload!): UploadFileEntityResponse!
  multipleUpload (refId: ID, ref: String, field: String, files: [Upload]!): [UploadFileEntityResponse]!
  updateFileInfo (id: ID!, info: FileInfoInput): UploadFileEntityResponse!
  removeFile (id: ID!): UploadFileEntityResponse
  createUsersPermissionsRole (data: UsersPermissionsRoleInput!): UsersPermissionsCreateRolePayload
  updateUsersPermissionsRole (id: ID!, data: UsersPermissionsRoleInput!): UsersPermissionsUpdateRolePayload
  deleteUsersPermissionsRole (id: ID!): UsersPermissionsDeleteRolePayload
  createUsersPermissionsUser (data: UsersPermissionsUserInput!): UsersPermissionsUserEntityResponse!
  updateUsersPermissionsUser (id: ID!, data: UsersPermissionsUserInput!): UsersPermissionsUserEntityResponse!
  deleteUsersPermissionsUser (id: ID!): UsersPermissionsUserEntityResponse!
  login (input: UsersPermissionsLoginInput!): UsersPermissionsLoginPayload!
  register (input: UsersPermissionsRegisterInput!): UsersPermissionsLoginPayload!
  forgotPassword (email: String!): UsersPermissionsPasswordPayload
  resetPassword (password: String!, passwordConfirmation: String!, code: String!): UsersPermissionsLoginPayload
  emailConfirmation (confirmation: String!): UsersPermissionsLoginPayload
}`

test('should generate a federated schema for strapi', async t => {
  const federated = buildFederatedInfo({
    schema: strapiSchema,
    options: { auto: true }
  })

  t.assert.equal(federated.schema, strapiSchemaFederated)
  await helper.assertService(t, federated)
})
