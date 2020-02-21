import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  RepositoryButton,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
  };

  async componentDidMount() {
    const { navigation } = this.props;

    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred?page=1`);

    this.setState({ stars: response.data, loading: false });
  }

  loadMore = async () => {
    const { navigation } = this.props;
    const { stars, page } = this.state;

    const newPage = page + 1;

    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${newPage}`
    );

    this.setState({ stars: [...stars, ...response.data], page: newPage });
  };

  refreshList = async () => {
    const { navigation } = this.props;

    this.setState({ loading: true });

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred?page=1`);

    this.setState({ stars: response.data, page: 1, loading: false });
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={loading}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
                <RepositoryButton onPress={() => this.handleNavigate(item)}>
                  <Icon name="search" size={20} color="#FFF" />
                </RepositoryButton>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
