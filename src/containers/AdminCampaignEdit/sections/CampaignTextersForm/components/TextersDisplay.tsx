import { css, StyleSheet } from "aphrodite";
import { IconButton } from "material-ui";
import DeleteIcon from "material-ui/svg-icons/action/delete";
import React from "react";
import Form from "react-formal";

import Slider from "../../../../../components/Slider";
import { dataTest } from "../../../../../lib/attributes";
import theme from "../../../../../styles/theme";

const styles = StyleSheet.create({
  removeButton: {
    width: 50
  },
  texterRow: {
    display: "flex",
    flexDirection: "row"
  },
  nameColumn: {
    width: 100,
    textOverflow: "ellipsis",
    marginTop: "auto",
    marginBottom: "auto",
    paddingRight: 10
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

interface Props {
  formValues: any;
  orgTexters: any;
  onChange(formValues: any): void;
  handleFocusTexterId(texterId: string | null): void;
}

const TextersDisplay: React.SFC<Props> = (props: Props) => {
  const { formValues, orgTexters, onChange, handleFocusTexterId } = props;

  const getDisplayName = (texterId: string) => {
    const texterObj = orgTexters.find((o) => o.id === texterId);
    return texterObj.displayName;
  };

  return (
    <div>
      {formValues.texters.map((texter, index) => {
        const messagedCount =
          texter.assignment.contactsCount - texter.assignment.needsMessageCount;
        return (
          <div
            {...dataTest("texterRow")}
            key={texter.id}
            className={css(styles.texterRow)}
          >
            <div className={css(styles.leftSlider)}>
              <Slider
                maxValue={formValues.contactsCount}
                value={messagedCount}
                color={theme.colors.darkGray}
                direction={1}
              />
            </div>
            <div className={css(styles.assignedCount)}>{messagedCount}</div>
            <div {...dataTest("texterName")} className={css(styles.nameColumn)}>
              {getDisplayName(texter.id)}
            </div>
            <div className={css(styles.input)}>
              <Form.Field
                {...dataTest("texterAssignment")}
                name={`texters[${index}].assignment.needsMessageCount`}
                hintText="Contacts"
                fullWidth
                onFocus={() => handleFocusTexterId(texter.id)}
                onBlur={() => handleFocusTexterId(null)}
              />
            </div>
            <div className={css(styles.slider)}>
              <Slider
                maxValue={formValues.contactsCount}
                value={texter.assignment.needsMessageCount}
                color={theme.colors.green}
                direction={0}
              />
            </div>
            {formValues.useDynamicAssignment ? (
              <div className={css(styles.input)}>
                <Form.Field
                  name={`texters[${index}].assignment.maxContacts`}
                  hintText="Max"
                  fullWidth
                  onFocus={() => handleFocusTexterId(texter.id)}
                  onBlur={() => handleFocusTexterId(null)}
                />
              </div>
            ) : (
              ""
            )}
            <div className={css(styles.removeButton)}>
              <IconButton
                onClick={async () => {
                  const currentFormValues = formValues;
                  const newFormValues = {
                    ...currentFormValues
                  };
                  newFormValues.texters = newFormValues.texters.slice();
                  if (messagedCount === 0) {
                    newFormValues.texters.splice(index, 1);
                  } else {
                    await handleFocusTexterId(texter.id);
                    newFormValues.texters[index] = {
                      ...texter,
                      assignment: {
                        needsMessageCount: 0
                      }
                    };
                  }
                  onChange(newFormValues);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TextersDisplay;
