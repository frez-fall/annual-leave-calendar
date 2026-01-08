/**
 * Webflow Code Component Definition
 * Maps the Calendar React component to a Webflow component
 */

import { Calendar } from './Calendar';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

export default declareComponent(Calendar, {
  name: 'Calendar & Leave Planner',
  description: 'Interactive calendar component for leave planning with automatic holiday detection and calculations',
  group: 'Data',
  props: {
    siteId: props.Text({
      name: 'Site ID',
      defaultValue: '',
    }),
    apiEndpoint: props.Text({
      name: 'API Endpoint',
      defaultValue: 'https://paylatertravel-us.webflow.io/leave-calendar/api/webflow-proxy',
    }),
    defaultState: props.Text({
      name: 'Default State',
      tooltip: 'If applicable, sets the default state for the loaded data',
      defaultValue: 'New South Wales',
    }),
    locale: props.Text({
      name: 'Locale',
      defaultValue: 'en-US',
    }),
    theme: props.Variant({
      name: 'Theme',
      options: ['dark', 'light'],
      defaultValue: 'dark',
    }),
  },
});

