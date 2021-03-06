import gql from "graphql-tag";
import PeopleIcon from "material-ui/svg-icons/social/people";
import { Table, TableBody } from "material-ui/Table";
import React from "react";

import {
  MembershipFilter,
  OrganizationMembership
} from "../../api/organization-membership";
import Empty from "../../components/Empty";
import InfiniteRelayList from "../../components/InfiniteRelayList";
import { AdminPeopleContext, PeopleRowEventHandlers } from "./context";
import PeopleRow from "./PeopleRow";

const PAGE_SIZE = 20;

const query = gql`
  query getPeople(
    $organizationId: String!
    $after: Cursor
    $first: Int
    $filter: MembershipFilter
  ) {
    organization(id: $organizationId) {
      id
      peopleCount
      memberships(first: $first, after: $after, filter: $filter) {
        edges {
          node {
            id
            user {
              id
              firstName
              lastName
              displayName
              email
            }
            role
            requestAutoApprove
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          totalCount
        }
      }
    }
  }
`;
interface PeopleTableProps {
  context: AdminPeopleContext;
  onlyCampaignId: string | false;
  nameSearch: string;
  rowEventHandlers: PeopleRowEventHandlers;
  lastMutated: Date;
}
const PeopleTable: React.StatelessComponent<PeopleTableProps> = ({
  context,
  nameSearch,
  onlyCampaignId,
  rowEventHandlers,
  lastMutated
}) => {
  const filter: MembershipFilter = {
    nameSearch: nameSearch === "" ? undefined : nameSearch,
    ...(onlyCampaignId ? { campaignId: onlyCampaignId } : {})
  };

  const campaignTitle =
    context.organization.campaigns.campaigns.find(
      (c) => c.id === onlyCampaignId
    )?.title || "";

  return (
    <Table selectable={false} style={{ width: "inherit", margin: "auto" }}>
      <TableBody displayRowCheckbox={false} showRowHover>
        <InfiniteRelayList
          query={query}
          dbLastUpdatedAt={lastMutated}
          queryVars={{
            organizationId: context.organization.id,
            first: PAGE_SIZE,
            filter
          }}
          nextQueryVars={(cursor) => ({
            after: cursor,
            filter
          })}
          toRelay={(data) => data.organization.memberships}
          renderNode={(membership: OrganizationMembership) => (
            <PeopleRow
              membership={membership}
              context={context}
              handlers={rowEventHandlers}
            />
          )}
          keyFunc={(membership) => membership.user.id}
          empty={() => (
            <Empty
              title={`Nobody in ${
                onlyCampaignId ? `campaign ${campaignTitle}` : "organization"
              } yet`}
              icon={<PeopleIcon />}
            />
          )}
          cliffHanger={(hasMore, last) => {
            const loadingClause = hasMore ? "Loading more... " : "";
            const countClause = `${last.pageInfo.totalCount} ${
              last.pageInfo.totalCount === 1 ? "person" : "people"
            } found`;
            const searchClause = nameSearch
              ? `with search query '${nameSearch}'`
              : "Try the search (at the top) to filter by name.";
            const campaignClause = onlyCampaignId
              ? `in campaign '${campaignTitle}'`
              : `in organization ${context.organization.id}`;

            return (
              <div style={{ paddingTop: 8 }}>
                <span>{`${loadingClause}${countClause} ${campaignClause} ${searchClause}.`}</span>
              </div>
            );
          }}
        />
      </TableBody>
    </Table>
  );
};
export default PeopleTable;
