import { Campaign, PaginatedCampaigns } from "./campaign";
import { ExternalSystem } from "./external-system";
import { LinkDomain, UnhealthyLinkDomain } from "./link-domain";
import { OptOut } from "./opt-out";
import { OrganizationMembership } from "./organization-membership";
import { OranizationSettings } from "./organization-settings";
import { RelayPaginatedResponse } from "./pagination";
import { Tag } from "./tag";
import { Team } from "./team";
import { User } from "./user";

export const TextRequestType = Object.freeze({
  UNSENT: "UNSENT",
  UNREPLIED: "UNREPLIED"
});

export interface AssignmentTarget {
  type: string;
  campaign: Campaign;
  countLeft: number;
  teamTitle: string;
  teamId: number;
  enabled: boolean;
  maxRequestCount: number;
}

export interface Organization {
  id: string;
  uuid: string;
  name: string;
  campaigns: PaginatedCampaigns;
  campaignsRelay: RelayPaginatedResponse<Campaign>;
  memberships: RelayPaginatedResponse<OrganizationMembership>;
  people: User[];
  peopleCount: number;
  optOuts: OptOut[];
  threeClickEnabled: boolean;
  optOutMessage: string;
  textingHoursEnforced: boolean;
  textingHoursStart: number;
  textingHoursEnd: number;
  textRequestFormEnabled: boolean;
  textRequestType: string;
  textRequestMaxCount: number;
  textsAvailable: boolean;
  pendingAssignmentRequestCount: number;
  currentAssignmentTargets: AssignmentTarget[];
  myCurrentAssignmentTarget: AssignmentTarget[];
  myCurrentAssignmentTargets: AssignmentTarget[];
  escalatedConversationCount: number;
  linkDomains: LinkDomain[];
  unhealthyLinkDomains: UnhealthyLinkDomain[];
  numbersApiKey: string;
  settings: OranizationSettings;
  tagList: Tag[];
  escalationTagList: Tag[];
  teams: Team[];
  externalSystems: RelayPaginatedResponse<ExternalSystem>;
}

export const schema = `
  enum TextRequestType {
    UNSENT
    UNREPLIED
  }

  type AssignmentTarget {
    type: String!
    campaign: Campaign
    countLeft: Int
    teamTitle: String
    teamId: Int
    enabled: Boolean
    maxRequestCount: Int
  }

  type Organization {
    id: ID
    uuid: String
    name: String
    campaigns(cursor:OffsetLimitCursor, campaignsFilter: CampaignsFilter): PaginatedCampaigns
    campaignsRelay(after: Cursor, first: Int, filter: CampaignsFilter): CampaignPage!
    memberships(after: Cursor, first: Int, filter: MembershipFilter): OrganizationMembershipPage
    people(role: String, campaignId: String, offset: Int): [User]
    peopleCount: Int
    optOuts: [OptOut]
    threeClickEnabled: Boolean
    optOutMessage: String
    textingHoursEnforced: Boolean
    textingHoursStart: Int
    textingHoursEnd: Int
    textRequestFormEnabled: Boolean
    textRequestType: TextRequestType
    textRequestMaxCount: Int
    textsAvailable: Boolean
    pendingAssignmentRequestCount: Int!
    currentAssignmentTargets: [AssignmentTarget]!
    myCurrentAssignmentTarget: AssignmentTarget
    myCurrentAssignmentTargets: [AssignmentTarget]!
    escalatedConversationCount: Int!
    linkDomains: [LinkDomain]!
    unhealthyLinkDomains: [UnhealthyLinkDomain]!
    numbersApiKey: String
    settings: OranizationSettings!
    tagList: [Tag]
    escalationTagList: [Tag]
    teams: [Team]!
    externalSystems(after: Cursor, first: Int): ExternalSystemPage!
  }
`;
