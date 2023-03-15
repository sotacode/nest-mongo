import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}
  
  
  
  async executeSeed(){

    await this.pokemonModel.deleteMany({}); //es lo mismo que delete 

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    const pokemonToInsert: { name: string, numero: number}[] = [];
    
    data.results.forEach(({name, url}) => {
      const segments = url.split('/');
      const numero = +segments[segments.length - 2];

      //const pokemon = await this.pokemonModel.create({name, numero});
      pokemonToInsert.push({name, numero})
    });
    await this.pokemonModel.insertMany(pokemonToInsert);


    return "Seed Executed";
  }
}
