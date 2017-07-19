import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';

import { SectionHeading } from './shared';

class AuditLogActorSection extends React.PureComponent {
  static propTypes = {
    auditEvent: PropTypes.shape({
      actor: PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.string,
        uuid: PropTypes.string,
        node: PropTypes.shape({
          name: PropTypes.string.isRequired,
          avatar: PropTypes.shape({
            url: PropTypes.string.isRequired
          }).isRequired
        })
      }).isRequired
    }).isRequired
  };

  render() {
    const { actor } = this.props.auditEvent;

    return (
      <section className="mb4">
        <SectionHeading className="m0 mb2">
          Actor
        </SectionHeading>
        <dl className="m0">
          <dt className="mt1 dark-gray">
            Actor Type
          </dt>
          <dd className="ml0">
            {actor.type}
          </dd>
          <dt className="mt1 dark-gray">
            Actor Name
          </dt>
          <dd className="ml0">
            {actor.name}
          </dd>
          <dt className="mt1 dark-gray">
            Actor UUID
          </dt>
          <dd className="ml0">
            {actor.uuid}
          </dd>
        </dl>
      </section>
    );
  }
}

export default Relay.createContainer(AuditLogActorSection, {
  initialVariables: {
    hasExpanded: false
  },

  fragments: {
    auditEvent: () => Relay.QL`
      fragment on AuditEvent {
        actor {
          name
          type
          uuid
          node {
            ...on User {
              name
              avatar {
                url
              }
            }
          }
        }
      }
    `
  }
});
