import { MenuItem } from "material-ui/Menu";
import SelectField from "material-ui/SelectField";
import React from "react";

import GSFormField from "./GSFormField";

export default class GSSelectField extends GSFormField {
  createMenuItems() {
    return this.props.choices.map(({ value, label }) => (
      <MenuItem value={value} key={value} primaryText={label} />
    ));
  }

  render() {
    return (
      <SelectField
        floatingLabelText={this.props.label}
        {...this.props}
        onChange={(event, index, value) => {
          this.props.onChange(value);
        }}
      >
        {this.createMenuItems()}
      </SelectField>
    );
  }
}
