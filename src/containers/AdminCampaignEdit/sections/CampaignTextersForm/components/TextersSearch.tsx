import AutoComplete from "material-ui/AutoComplete";
import React from "react";

import { dataSourceItem } from "../../../../../components/utils";

const inlineStyles = {
  autocomplete: {
    marginBottom: 24
  }
};

interface Props {
  orgTexters: any;
  texters: any;
  searchText: string;
  handleSearchTexters(term: string): void;
  onChange(formValues: any): void;
}

const TextersSearch: React.SFC<Props> = (props: Props) => {
  const {
    orgTexters,
    texters,
    searchText,
    onChange,
    handleSearchTexters
  } = props;

  const dataSource = orgTexters
    .filter(
      (orgTexter) => !texters.find((texter) => texter.id === orgTexter.id)
    )
    .map((orgTexter) => dataSourceItem(orgTexter.displayName, orgTexter.id));

  const filter = (searchTerm: string, key: string) =>
    key === "allTexters"
      ? true
      : AutoComplete.caseInsensitiveFilter(searchTerm, key);

  console.log("search props", props);

  return (
    <AutoComplete
      style={inlineStyles.autocomplete}
      autoFocus
      onFocus={() => handleSearchTexters("")}
      onUpdateInput={handleSearchTexters}
      searchText={searchText}
      filter={filter}
      hintText="Search for texters to assign"
      dataSource={dataSource}
      onNewRequest={(value) => {
        // If you're searching but get no match, value is a string
        // representing your search term, but we only want to handle matches
        if (typeof value === "object") {
          const texterId = value.value.key;
          const newTexter = props.orgTexters.find(
            (texter) => texter.id === texterId
          );
          onChange({
            texters: [
              ...texters,
              {
                id: texterId,
                firstName: newTexter.firstName,
                assignment: {
                  contactsCount: 0,
                  needsMessageCount: 0
                }
              }
            ]
          });
        }
      }}
    />
  );
};

export default TextersSearch;
