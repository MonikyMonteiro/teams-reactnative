import { useState, useEffect, useRef } from 'react';
import { Alert, FlatList, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Input } from '@components/Input';
import { Filter } from '@components/Filter';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Highlight } from '@components/Highlight';
import { ListEmpty } from '@components/ListEmpty';
import { PlayerCard } from '@components/PlayerCard';
import { ButtonIcon } from '@components/ButtonIcon';

import { Container, Form, HeaderList, NumbersOfPlayers } from './styles';
import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import { AppError } from '@utils/AppError';
import { playersGetByGroupAndTeam } from '@storage/player/playersGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { groupRemoveByName } from '@storage/group/groupRemoveByName';

type RouteParams = {
  group: string;
}

export function Players() {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [team, setTeam] = useState('Time A');
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

    const route = useRoute();
    const { group } = route.params as RouteParams;

    const newPlayerNameInputRef = useRef<TextInput>(null);

    const navigation = useNavigation();

    async function handleAddPlayer() {
      if (newPlayerName.trim().length === 0) {
        return Alert.alert('Nova pessoa', 'Informe o nome da pessoa para adicionar.');
      }

      const newPlayer = {
        name: newPlayerName,
        team,
      }

     try {
      await playerAddByGroup(newPlayer, group);

      newPlayerNameInputRef.current?.blur();

      setNewPlayerName('');
      fetchPlayersByTeam();
    
     } catch (error)  {
      if (error instanceof AppError) {
        Alert.alert('Nova pessoa' , error.message);
      } else {
        console.log(error);
        Alert.alert('Nova pessoa' , 'N??o foi poss??vel adicionar.');
      }

      }
  }
 async function fetchPlayersByTeam() {
  try {
    const playersByTeam = await playersGetByGroupAndTeam(group, team);
    setPlayers(playersByTeam);
  } catch (error) {
    console.log(error);
    Alert.alert('Pessoas' , 'N??o foi poss??vel carregar as pessoas do time selecionado');
    
  }
 }

 async function handlePlayerRemove(playerName: string) {
  try {
    await playerRemoveByGroup(playerName, group);
    fetchPlayersByTeam();
  } catch (error) {
    console.log(error);
    Alert.alert('Remover Pessoa' , 'N??o foi poss??vel remover essa pessoa.');
  }

 }

 async function groupRemove() {
  try {
    await groupRemoveByName(group);
    navigation.navigate('groups');
  } catch(error) {
    console.log(error);
    Alert.alert('Remover grupo' , 'N??o foi poss??vel remover o grupo');
  }
 }

  async function handleGroupRemove() {
    Alert.alert(
      'Remover',
      'Deseja remover o grupo?',
      [
        { Text: 'N??o', style: 'cancel' },
        { text: 'Sim' , onPress: () => groupRemove() }
      ]
    );
  }


  useEffect(() => {
    fetchPlayersByTeam();
  }, [team]);


    return (
        <Container>
          <Header showBackButton />

          <Highlight 
           title ={group}
           subtitle="Adicione a galera e separe os times"
        />
        <Form>
         <Input
          inputRef={newPlayerNameInputRef}
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          placeholder="Nome da pessoa"
          autoCorrect={false}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
      
      />
         <ButtonIcon
          icon="add" 
          onPress={handleAddPlayer}
          />
     </Form>
       <HeaderList>
         <FlatList 
          data={['Time A', 'Time B']}
         keyExtractor={item => item}
        renderItem={({ item }) => (
     <Filter 
       title={item}
       isActive={item === team}
       onPress={() => setTeam(item)}
     />
     )}
     horizontal
    />

    <NumbersOfPlayers>
     {players.length}
    </NumbersOfPlayers>

 </HeaderList>

 <FlatList 
  data={players}
  keyExtractor={item => item.name}
  renderItem={({ item }) => (
   <PlayerCard
    name={item.name}
    onRemove={() => handlePlayerRemove(item.name)}
  />
  )}
  ListEmptyComponent= {() => (
   <ListEmpty
     message="N??o h?? pessoas nesse time"
   />
   )}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={[{ paddingBottom: 100 }, players.length === 0 && { flex: 1 }]}
   />

   <Button
     title="Remover Turma"
     type="SECONDARY"
     onPress={handleGroupRemove}
    />

  </Container>
    );
}