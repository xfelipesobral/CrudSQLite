import executar from './rodarSql'

const porcentagem = (total, atual) => {
  const p = (atual / total) * 100
  return p.toFixed(2)
}

export default class Banco {
  constructor() {
    this.tabela
    this.coluna
    this.mensagem
    this.chaves = []
    this.chavesPrimarias
    this.colunasString = ''
    this.colunasStringIns = ''
    this.valores = []
  }

  imprimirMensagem = (msg) => {
    if (this.mensagem && typeof this.mensagem === 'function') {
      this.mensagem(msg)
    }
  }

  // Iniciar interação
  init = () => {
    // Inicializa variáveis...
    this.chaves = []
    this.valores = []
    this.colunasString = ''
    this.colunasStringIns = ''

    // Separa chaves do objeto
    for (const chave in this.base) {
      this.chaves.push(chave)
    }

    // Monta string da coluna e de insert
    // Ex: 'EmpresaChaveApp, EmpresaCodigo, EmpresaRazaoSocial, EmpresaAppHost, EmpresaAppUrlBase', '?, ?, ?, ?, ?'
    if (this.coluna) {
      this.chaves.forEach((chave, i) => {
        this.valores.push(this.coluna[chave] || '')
        this.colunasString += i === 0 ? chave : `, ${chave}`
        this.colunasStringIns += i === 0 ? '?' : ', ?'
      })
    }
  }

  executar = executar

  // ##############################################

  // Inserir no banco
  inserir = async () => {
    const sql = `INSERT INTO ${this.tabela} (${this.colunasString}) VALUES (${this.colunasStringIns})`
    return await this.executar(sql, this.valores)
  }

  // Atualizar registro
  atualizar = async () => {
    let sql = `UPDATE ${this.tabela} SET`
    const atributos = [] // Atributos modificados

    this.chaves.forEach(chave => {
      if (this.chavesPrimarias.find(i => i === chave)) return // Não pode alterar chaves primárias

      if (this.coluna[chave] !== undefined) {
        sql += ` ${chave} = ?,`
        atributos.push(this.coluna[chave])
      }
    })

    if (atributos.length === 0) return '' // Se não foi inserido produtos, retorna da função

    sql += '*' // Marca ultima linha inserida
    sql = sql.replace(',*', ' WHERE ') // Remove marcação e adiciona where

    // Adicina where com as chaves primárias
    this.chavesPrimarias.forEach((chaveP, i) => {
      sql += i === 0 ? `${chaveP} = ?` : ` AND ${chaveP} = ?`
      atributos.push(this.coluna[chaveP])
    })

    return await this.executar(sql, atributos)
  }

  // Buscar
  buscar = async (filtros) => {

    const atributos = []
    let sql = `SELECT * FROM ${this.tabela} `

    // Verificar se tem filtros
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {


        if (!sql.match('WHERE')) {
          sql += `WHERE ${key} = ? `
        } else {
          sql += `AND ${key} = ?`
        }

        atributos.push(value)
      })
    }

    return await this.executar(sql, atributos)
  }

  // Sincronizar dado
  sincronizar = async (array, mensagem) => {
    if (mensagem) {
      this.mensagem = mensagem
    }

    if (array?.length > 0) {
      const fila = array.length
      let i = 0

      for (const obj of array) {

        // Verifica chaves primárias (para buscar e modificar)
        let obj_chave = {}
        this.chavesPrimarias?.forEach(chave => {
          if (obj[chave]) {
            const str = `{"${chave}": "${obj[chave]}" }`
            obj_chave = { ...obj_chave, ...JSON.parse(str) }
          }
        })

        // Verifica se o item já está no banco
        this.coluna = obj
        this.init()

        if (await this.buscar(obj_chave)) {
          await this.atualizar() // Se já existe, apenas atualiza
        } else {
          await this.inserir() // Caso não exista, cria
        }

        i++
        this.imprimirMensagem(`${this.apelido || this.tabela}: ${porcentagem(fila, i)}%`)

      }
    }

  }

}