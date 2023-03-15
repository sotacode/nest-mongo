import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(termino: string) {
    let pokemon: Pokemon;
    //Numero
    if(!isNaN(+termino)){
      pokemon = await this.pokemonModel.findOne({numero: termino})
    }

    //MONGO ID
    if( !pokemon && isValidObjectId(termino) ){
      pokemon = await this.pokemonModel.findById(termino)
    }

    //Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: termino})
    }


    if(!pokemon){
      throw new NotFoundException(`Pokemon with id, name or numero "${termino}" not found`)
    }
    return pokemon;
  }

  async update(termino: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(termino);
    if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto);
      return {
        ...pokemon.toJSON(), ...updatePokemonDto
      };
    } catch (error) {
      this.handleExceptions(error)
    }

  }

  async remove(id: string) {
    //const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if(deletedCount===0) throw new BadRequestException(`Pokemon with id "${id}" not found`)
    else return `Pokemon with id "${id}" eliminated succefull`;
  }


  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }
}
