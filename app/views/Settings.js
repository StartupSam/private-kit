import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  BackHandler,
  FlatList,
  Alert,
} from 'react-native';
import Yaml from 'js-yaml';
import RNFetchBlob from 'rn-fetch-blob';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
  withMenuContext,
} from 'react-native-popup-menu';
const { SlideInMenu } = renderers;
import colors from '../constants/colors';
import backArrow from './../assets/images/backArrow.png';
import closeIcon from './../assets/images/closeIcon.png';
import languages from './../locales/languages';

const authoritiesListURL =
  'https://github.com/tripleblindmarket/safe-places/blob/develop/healthcare-authorities.yaml';

// Temporary test object with authorities data
const authoritiesList = {
  "Steve's Example Health Authority": {
    url:
      'https://raw.githack.com/tripleblindmarket/safe-places/develop/examples/safe-paths.json',
  },
  "Ramesh's Example Health Org": {
    url:
      'https://raw.githack.com/tripleblindmarket/safe-places/develop/examples/anotherlocale-safe-paths.json',
  },
};

class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAuthorities: [],
    };
  }

  backToMain() {
    this.props.navigation.navigate('LocationTrackingScreen', {});
  }

  handleBackPress = () => {
    this.props.navigation.navigate('LocationTrackingScreen', {});
    return true;
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  // This function isn't working - will focus on UI function for now and
  // leave this for someone else to connect to live data
  fetchAuthoritiesList() {
    try {
      RNFetchBlob.fetch('GET', authoritiesListURL).then(res => {
        // the temp file path
        console.log(res);
        console.log('The file saved to ', res.path());
        RNFetchBlob.fs.Yaml.safeLoad(res.path(), 'utf8').then(records => {
          // delete the file first using flush
          res.flush();
          this.parseCSV(records).then(parsedRecords => {
            console.log(parsedRecords);
            console.log(Object.keys(parsedRecords).length);
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Add selected authorities to state, for display in the FlatList
  addAuthorityToState(authority) {
    this.setState({
      selectedAuthorities: this.state.selectedAuthorities.concat({
        key: authority,
        url: authoritiesList[authority].url,
      }),
    });
  }

  removeAuthorityFromState(authority) {
    Alert.alert(
      'Remove authority',
      'Are you sure you want to remove this authority data source?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Proceed',
          onPress: () => {
            let removalIndex = this.state.selectedAuthorities.indexOf(
              authority,
            );
            this.state.selectedAuthorities.splice(removalIndex, 1);

            this.setState({
              selectedAuthorities: this.state.selectedAuthorities,
            });
          },
        },
      ],
      { cancelable: false },
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backArrowTouchable}
            onPress={() => this.backToMain()}>
            <Image style={styles.backArrow} source={backArrow} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.main}>
          <Text style={styles.headerTitle}>
            {languages.t('label.authorities_title')}
          </Text>
          <Text style={styles.sectionDescription}>
            {languages.t('label.authorities_desc')}
          </Text>
        </View>

        <View style={styles.listContainer}>
          {Object.keys(this.state.selectedAuthorities).length == 0 ? (
            <Text style={(styles.sectionDescription, { color: '#dd0000' })}>
              No data sources yet! Tap below to add one.
            </Text>
          ) : (
            <FlatList
              data={this.state.selectedAuthorities}
              renderItem={({ item }) => (
                <View style={styles.flatlistRowView}>
                  <Text style={styles.item}>{item.key}</Text>
                  <TouchableOpacity
                    onPress={() => this.removeAuthorityFromState(item)}>
                    <Image source={closeIcon} style={styles.closeIcon} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        <Menu
          name='AuthoritiesMenu'
          renderer={SlideInMenu}
          style={{ flex: 1, justifyContent: 'center' }}>
          <MenuTrigger>
            <TouchableOpacity
              style={styles.startLoggingButtonTouchable}
              onPress={() =>
                this.props.ctx.menuActions.openMenu('AuthoritiesMenu')
              }>
              <Text style={styles.startLoggingButtonText}>
                Add Trusted Source
              </Text>
            </TouchableOpacity>
          </MenuTrigger>
          <MenuOptions>
            {Object.keys(authoritiesList).map(key => {
              return (
                <MenuOption
                  key={key}
                  onSelect={() => {
                    this.addAuthorityToState(key);
                  }}>
                  <Text style={styles.menuOptionText}>{key}</Text>
                </MenuOption>
              );
            })}
            <MenuOption
              onSelect={() => {
                Alert.alert(
                  'Coming soon',
                  "You'll be able to add custom data sources in an imminent update.",
                  [
                    {
                      text: 'Done',
                      onPress: () => {
                        console.log('Tried to add custom URL data source');
                      },
                    },
                  ],
                  { cancelable: false },
                );
              }}>
              <Text style={styles.menuOptionText}>Add authority via URL</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                console.log(this.state.selectedAuthorities);
              }}>
              <Text style={styles.menuOptionText}>Console log state</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: colors.PRIMARY_TEXT,
    backgroundColor: colors.WHITE,
  },
  main: {
    flex: 2,
    flexDirection: 'column',
    textAlignVertical: 'top',
    // alignItems: 'center',
    padding: 20,
    width: '96%',
    alignSelf: 'center',
  },
  listContainer: {
    flex: 3,
    flexDirection: 'column',
    textAlignVertical: 'top',
    // alignItems: 'center',
    padding: 20,
    width: '96%',
    alignSelf: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    color: colors.PRIMARY_TEXT,
    backgroundColor: colors.WHITE,
  },
  valueName: {
    fontSize: 20,
    fontWeight: '800',
  },
  value: {
    fontSize: 20,
    fontWeight: '200',
  },
  startLoggingButtonTouchable: {
    borderRadius: 12,
    backgroundColor: '#665eff',
    height: 52,
    alignSelf: 'center',
    width: '79%',
    justifyContent: 'center',
  },
  startLoggingButtonText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  buttonTouchable: {
    borderRadius: 12,
    backgroundColor: '#665eff',
    height: 52,
    alignSelf: 'center',
    width: '79%',
    marginTop: 30,
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  mainText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    textAlignVertical: 'center',
    padding: 20,
  },
  smallText: {
    fontSize: 10,
    lineHeight: 24,
    fontWeight: '400',
    textAlignVertical: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
  },
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(189, 195, 199,0.6)',
    alignItems: 'center',
  },
  backArrowTouchable: {
    width: 60,
    height: 60,
    paddingTop: 21,
    paddingLeft: 20,
  },
  backArrow: {
    height: 18,
    width: 18.48,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    overflow: 'scroll',
    fontFamily: 'OpenSans-Regular',
  },
  menuOptionText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    padding: 10,
  },
  flatlistRowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 7,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#999999',
  },
  item: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 16,
    padding: 10,
    maxWidth: '90%',
  },
  closeIcon: {
    width: 15,
    height: 15,
    opacity: 0.5,
    marginTop: 14,
  },
});

export default withMenuContext(SettingsScreen);