// Share extension entry point
// This is the root component for the iOS share sheet
import { AppRegistry } from 'react-native';
import ShareExtension from './components/ShareExtension';

// IMPORTANT: the first argument must be "shareExtension"
AppRegistry.registerComponent('shareExtension', () => ShareExtension);
