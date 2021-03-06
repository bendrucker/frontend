import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormInputLabel from './FormInputLabel';
import FormInputHelp from './FormInputHelp';
import FormInputErrors from './FormInputErrors';

class FormSelect extends React.Component {
  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ).isRequired,
    value: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    help: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    errors: PropTypes.array,
    required: PropTypes.bool,
    disabled: PropTypes.bool
  };

  render() {
    return (
      <div className={classNames("mb2", this.props.className)}>
        <FormInputLabel
          label={this.props.label}
          errors={this._hasErrors()}
          required={this.props.required}
        >
          {this._renderSelect()}
        </FormInputLabel>
        {this._renderErrors()}
        {this._renderHelp()}
      </div>
    );
  }

  focus() {
    this.input.focus();
  }

  _hasErrors() {
    return this.props.errors && this.props.errors.length > 0;
  }

  _renderErrors() {
    if (this._hasErrors()) {
      return (
        <FormInputErrors errors={this.props.errors} />
      );
    }
  }

  _renderHelp() {
    if (this.props.help) {
      return (
        <FormInputHelp html={this.props.help} />
      );
    }
  }

  _renderSelect() {
    return (
      <select name={this.props.name} className="select" defaultValue={this.props.value} onChange={this.props.onChange} disabled={this.props.disabled}>
        <option />
        {this.props.options.map((option, idx) => {
          return (
            <option key={idx} value={option.value}>{option.label}</option>
          );
        })}
      </select>
    );
  }
}

export default FormSelect;
