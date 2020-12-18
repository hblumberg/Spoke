import { css, StyleSheet } from "aphrodite";
import { ApolloQueryResult } from "apollo-client/core/types";
import gql from "graphql-tag";
import orderBy from "lodash/orderBy";
import RaisedButton from "material-ui/RaisedButton";
import Snackbar from "material-ui/Snackbar";
import { red600 } from "material-ui/styles/colors";
import Toggle from "material-ui/Toggle";
import moment from "moment";
import React from "react";
import { compose } from "recompose";
import * as yup from "yup";

import GSForm from "../../../../components/forms/GSForm";
import { dataTest } from "../../../../lib/attributes";
import { QueryMap } from "../../../../network/types";
import theme from "../../../../styles/theme";
import { loadData } from "../../../hoc/with-operations";
import CampaignFormSectionHeading from "../../components/CampaignFormSectionHeading";
import {
  asSection,
  FullComponentProps,
  RequiredComponentProps
} from "../../components/SectionWrapper";
import TextersDisplay from "./components/TextersDisplay";
import TextersSearch from "./components/TextersSearch";

const styles = StyleSheet.create({
  sliderContainer: {
    border: `1px solid ${theme.colors.lightGray}`,
    padding: 10,
    borderRadius: 8
  },
  removeButton: {
    width: 50
  },
  texterRow: {
    display: "flex",
    flexDirection: "row"
  },
  alreadyTextedHeader: {
    textAlign: "right",
    fontWeight: 600,
    fontSize: 16
  },
  availableHeader: {
    fontWeight: 600,
    fontSize: 16
  },
  nameColumn: {
    width: 100,
    textOverflow: "ellipsis",
    marginTop: "auto",
    marginBottom: "auto",
    paddingRight: 10
  },
  splitToggle: {
    ...theme.text.body,
    flex: "1 1 50%"
  },
  slider: {
    flex: "1 1 35%",
    marginTop: "auto",
    marginBottom: "auto",
    paddingRight: 10
  },
  leftSlider: {
    flex: "1 1 35%",
    marginTop: "auto",
    marginBottom: "auto",
    paddingRight: 10
  },
  headerContainer: {
    display: "flex",
    borderBottom: `1px solid ${theme.colors.lightGray}`,
    marginBottom: 20
  },
  assignedCount: {
    width: 40,
    fontSize: 16,
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: "center",
    marginTop: "auto",
    marginBottom: "auto",
    marginRight: 10,
    display: "inline-block",
    backgroundColor: theme.colors.lightGray
  },
  input: {
    width: 50,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 10,
    marginTop: "auto",
    marginBottom: "auto",
    display: "inline-block"
  }
});

const inlineStyles = {
  header: {
    ...theme.text.header
  },
  splitAssignmentToggle: {
    width: "auto",
    marginLeft: "auto"
  },
  button: {
    display: "inline-block",
    marginTop: 15
  }
};

interface HocProps {
  mutations: {
    editCampaign(payload: Values): ApolloQueryResult<any>;
  };
  data: {
    campaign: {
      id: string;
      texters: Texter[];
      isStarted: boolean;
      dueBy: string;
    };
  };
}

interface State {
  autoSplit: boolean;
  // focusedTexterId: string | null;
  searchText: string;
  snackbarOpen: boolean;
  snackbarMessage: string;
}

interface InnerProps extends FullComponentProps, HocProps {
  orgTexters: any[];
  organizationId: string;
  formValues: any;
  contactsCount: number;
  saveLabel: string;
  saveDisabled: boolean;
  ensureComplete: boolean;
  isOverdue: boolean;
  onChange(): void;
  onSubmit(): void;
}

export interface Texter {
  id: string;
  firstName: string;
  lastName: string;
  assignment: any;
}

class CampaignTextersForm extends React.Component<InnerProps, State> {
  state = {
    autoSplit: false,
    // focusedTexterId: null,
    searchText: "",
    snackbarOpen: false,
    snackbarMessage: ""
  };

  formSchema = yup.object({
    texters: yup.array().of(
      yup.object({
        id: yup.string(),
        assignment: yup.object({
          needsMessageCount: yup.string(),
          maxContacts: yup.string().nullable()
        })
      })
    )
  });

  formValues = () => {
    const { campaign } = this.props.data;
    const unorderedTexters = campaign.texters;
    return {
      ...this.props.formValues,
      texters: orderBy(
        unorderedTexters,
        ["firstName", "lastName"],
        ["asc", "asc"]
      )
    };
  };

  onChange = (formValues) => {
    console.log("on change", formValues);
  };

  addAllTexters = () => {
    const { orgTexters } = this.props;

    const textersToAdd = orgTexters.map((orgTexter) => {
      const { id } = orgTexter;
      const { firstName } = orgTexter;
      return {
        id,
        firstName,
        assignment: {
          contactsCount: 0,
          needsMessageCount: 0
        }
      };
    });

    this.onChange({ texters: textersToAdd });
  };

  removeEmptyTexters = () => {
    this.onChange({
      texters: this.props.formValues.texters.filter(
        (t) =>
          t.assignment.contactsCount !== 0 ||
          t.assignment.needsMessageCount !== 0
      )
    });
  };

  // see note below for dynamic assignments
  // handleDynamicAssignmentToggle = (_ev, toggled) =>
  //   this.props.onChange({ useDynamicAssignment: toggled });

  handleSearchTexters = (searchText: string) => {
    this.setState({ searchText });
  };

  handleFocusTexterId = (focusedTexterId: string | null) => {
    // this.setState({ focusedTexterId });
  };

  handleSplitAssignmentsToggle = (_ev: any, toggled: boolean) =>
    this.setState({ autoSplit: toggled }, () => {
      if (!this.state.autoSplit) return;

      const values = this.formValues();
      const { texters } = values;
      let { contactsCount } = values;
      contactsCount = Math.floor(contactsCount / texters.length);
      const newTexters = texters.map((texter) => ({
        ...texter,
        assignment: {
          ...texter.assignment,
          contactsCount
        }
      }));
      const newFormValues = {
        ...this.formValues(),
        texters: newTexters
      };
      this.onChange(newFormValues);
    });

  handleSnackbarClose = () =>
    this.setState({ snackbarOpen: false, snackbarMessage: "" });

  render() {
    const { saveLabel, saveDisabled, orgTexters } = this.props;
    const { searchText } = this.state;

    const assignedContacts = this.formValues().texters.reduce(
      (prev, texter) => prev + texter.assignment.contactsCount,
      0
    );

    const headerColor =
      assignedContacts === this.formValues().contactsCount
        ? theme.colors.green
        : theme.colors.orange;

    const shouldShowSearch = orgTexters && orgTexters.length > 0;
    const isOverdue = moment().isSameOrAfter(this.props.data.campaign.dueBy);
    const numberAssigned =
      assignedContacts / this.formValues().contactsCount || 0;
    const numberUnassigned =
      this.formValues().contactsCount - assignedContacts || 0;

    return (
      <div>
        <CampaignFormSectionHeading
          title="Who should send the texts?"
          subtitle={
            isOverdue && (
              <span style={{ color: red600 }}>
                This campaign is overdue! Please change the due date before
                editing Texters
              </span>
            )
          }
        />
        {/* TODO: re-enable once dynamic assignment is fixed (#548) */}
        {/* <div>
          <Toggle
            {...dataTest("useDynamicAssignment")}
            label="Dynamically assign contacts"
            toggled={this.formValues().useDynamicAssignment}
            onToggle={this.handleDynamicAssignmentToggle}
          />
          {this.formValues().useDynamicAssignment && (
            <OrganizationJoinLink
              organizationUuid={organizationUuid}
              campaignId={campaignId}
            />
          )}
        </div> */}
        <GSForm
          schema={this.formSchema}
          value={this.formValues()}
          onChange={this.onChange}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {shouldShowSearch && (
              <TextersSearch
                texters={this.formValues().texters}
                orgTexters={orgTexters}
                searchText={searchText}
                handleSearchTexters={this.handleSearchTexters}
                onChange={this.onChange}
              />
            )}
            <div>
              <RaisedButton
                {...dataTest("addAll")}
                label="Add All"
                onClick={() => this.addAllTexters()}
              />
              <RaisedButton
                {...dataTest("addAll")}
                label="Remove Empty"
                onClick={() => this.removeEmptyTexters()}
              />
            </div>
          </div>
          <div className={css(styles.sliderContainer)}>
            <div className={css(styles.headerContainer)}>
              <div
                style={{
                  ...inlineStyles.header,
                  color: headerColor,
                  flex: "1 1 50%"
                }}
              >
                {`Assigned contacts: ${numberAssigned}. Left unassigned: ${numberUnassigned}`}
              </div>
              <div className={css(styles.splitToggle)}>
                <Toggle
                  {...dataTest("autoSplit")}
                  label="Split assignments"
                  style={inlineStyles.splitAssignmentToggle}
                  toggled={this.state.autoSplit}
                  onToggle={this.handleSplitAssignmentsToggle}
                />
              </div>
            </div>
            <div className={css(styles.texterRow)}>
              <div
                className={css(styles.leftSlider, styles.alreadyTextedHeader)}
              >
                Already texted
              </div>
              <div className={css(styles.assignedCount)} />
              <div className={css(styles.nameColumn)} />
              <div className={css(styles.input)} />
              <div className={css(styles.slider, styles.availableHeader)}>
                Available to assign
              </div>
              <div className={css(styles.removeButton)} />
            </div>
            <TextersDisplay
              formValues={this.formValues()}
              orgTexters={orgTexters}
              onChange={this.onChange}
              handleFocusTexterId={this.handleFocusTexterId}
            />
          </div>
        </GSForm>
        <RaisedButton
          label={saveLabel}
          disabled={saveDisabled}
          onClick={this.props.onSubmit}
          style={inlineStyles.button}
        />
        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={3000}
          onRequestClose={this.handleSnackbarClose}
        />
      </div>
    );
  }
}

const queries: QueryMap<InnerProps> = {
  data: {
    query: gql`
      query getCampaignBasics($campaignId: String!) {
        campaign(id: $campaignId) {
          id
          texters {
            id
            firstName
            lastName
            displayName
            assignment(campaignId: $campaignId) {
              contactsCount
              needsMessageCount: contactsCount(
                contactsFilter: { messageStatus: "needsMessage" }
              )
              maxContacts
            }
          }
          isStarted
          dueBy
        }
      }
    `,
    options: (ownProps) => ({
      variables: {
        campaignId: ownProps.campaignId
      }
    })
  }
};

export default compose<InnerProps, RequiredComponentProps>(
  asSection({
    title: "Texters",
    readinessName: "texters",
    jobQueueNames: [],
    expandAfterCampaignStarts: true,
    expandableBySuperVolunteers: true
  }),
  loadData({
    queries
    // mutations
  })
)(CampaignTextersForm);
