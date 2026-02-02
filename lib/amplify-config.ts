// This file MUST be imported before any other Amplify imports
// to ensure Amplify is configured before any clients are created
import { Amplify } from 'aws-amplify';
import amplifyConfig from '../amplify_outputs.json';

Amplify.configure(amplifyConfig);

export { amplifyConfig };
