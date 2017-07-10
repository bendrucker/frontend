import React from 'react';
import PropTypes from 'prop-types';

import FormCheckbox from '../shared/FormCheckbox';
import FormInputLabel from '../shared/FormInputLabel';
import FormRadioGroup from '../shared/FormRadioGroup';
import FormTextField from '../shared/FormTextField';
import Panel from '../shared/Panel';
import Button from '../shared/Button';

import ValidationErrors from '../../lib/ValidationErrors';
import TeamPrivacyConstants from '../../constants/TeamPrivacyConstants';

class TeamForm extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    privacy: PropTypes.oneOf(Object.keys(TeamPrivacyConstants)),
    isDefaultTeam: PropTypes.bool,
    errors: PropTypes.array,
    onChange: PropTypes.func,
    saving: PropTypes.bool,
    button: PropTypes.string.isRequired,
    uuid: PropTypes.string,
    autofocus: PropTypes.bool
  };

  componentDidMount() {
    if(this.props.autofocus) {
      this.nameTextField.focus();
    }
  }

  render() {
    const errors = new ValidationErrors(this.props.errors);

    return (
      <Panel>
        <Panel.Section>
          <FormTextField
            label="Name"
            help="The name for the team (supports :emoji:)"
            errors={errors.findForField("name")}
            value={this.props.name}
            onChange={this.handleTeamNameChange}
            required={true}
            ref={(nameTextField) => this.nameTextField = nameTextField}
          />

          <FormTextField
            label="Description"
            help="The description for the team (supports :emoji:)"
            errors={errors.findForField("description")}
            value={this.props.description}
            onChange={this.handleDescriptionChange}
          />
        </Panel.Section>

        <Panel.Section>
          <FormRadioGroup
            name="team-privacy"
            label="Visibility"
            help="Something"
            value={this.props.privacy}
            errors={errors.findForField("privacy")}
            onChange={this.handlePrivacyChange}
            options={[
              { label: "Visible", value: TeamPrivacyConstants.VISIBLE, help: "Can be seen by all members within the organization", badge: "Recommended" },
              { label: "Secret", value: TeamPrivacyConstants.SECRET, help: "Can only only be seen by organization administrators and members of this team" }
            ]}
          />
        </Panel.Section>

        <Panel.Section>
          <FormInputLabel label="Default" />

          <FormCheckbox
            name="team-is-default-team"
            label="Automatically add new users to this team"
            help="Users will automatically be added to this team when they sign in with SSO"
            checked={this.props.isDefaultTeam}
            onChange={this.handleIsDefaultTeamChange}
          />
        </Panel.Section>

        {this.renderUUIDSection()}

        <Panel.Footer>
          <Button loading={this.props.saving ? this.props.button : false} theme="success">{this.props.button}</Button>
        </Panel.Footer>
      </Panel>
    );
  }

  renderUUIDSection() {
    if(this.props.uuid) {
      return (
        <Panel.Section>
          <FormInputLabel label="UUID" />

          <code className="block bg-silver p2 rounded">{this.props.uuid}</code>
          <p className="dark-gray p0 mt1"> You can use this <code>UUID</code> to reference this team when using the <a href="/docs/rest-api/pipelines#create-a-pipeline" className="blue hover-navy">Create a Pipeline</a> REST API</p>
        </Panel.Section>
      )
    }
  }

  handleTeamNameChange = (evt) => {
    this.props.onChange('name', evt.target.value);
  };

  handleDescriptionChange = (evt) => {
    this.props.onChange('description', evt.target.value);
  };

  handlePrivacyChange = (evt) => {
    this.props.onChange('privacy', evt.target.value);
  };

  handleIsDefaultTeamChange = (evt) => {
    this.props.onChange('isDefaultTeam', evt.target.checked);
  };
}

export default TeamForm;
