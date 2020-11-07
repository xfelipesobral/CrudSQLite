class Banco {
    constructor() {
        this.tabela
        this.coluna
        this.chaves = []
        this.chavesPrimarias
        this.colunasString = ''
        this.colunasStringIns = ''
    }

    init = () => {
        // Separa chaves do objeto
        for (const chave in this.coluna) {
            this.chaves.push(chave)
        }

        // Monta string da coluna e de insert
        // Ex: 'EmpresaChaveApp, EmpresaCodigo, EmpresaRazaoSocial, EmpresaAppHost, EmpresaAppUrlBase', '?, ?, ?, ?, ?'
        this.chaves.forEach((chave, i) => {
            this.colunasString += i === 0 ? chave : `, ${chave}`
            this.colunasStringIns += i === 0 ? '?' : ', ?'
        })
    }

    inserir = () => {
        const sql = `INSERT INTO ${this.tabela} (${this.colunasString}) VALUES (${this.colunasStringIns})`
        return sql
    }

    atualizar = () => {
        let sql = `UPDATE ${this.tabela} SET`
        const atributos = [] // Atributos modificados

        this.chaves.forEach(chave => {
            if (this.chavesPrimarias.find(i => i === chave)) return // Não pode alterar chaves primárias
            
            if (this.coluna[chave] !== undefined) { 
                sql += ` ${chave} = ?,`
                atributos.push(this.coluna[chave]) 
            }
        })

        if (atributos.length === 0) return // Se não foi inserido produtos, retorna da função

        sql += '*' // Marca ultima linha inserida
        sql = sql.replace(',*', ' WHERE ') // Remove marcação e adiciona where
        
        // Adicina where com as chaves primárias
        this.chavesPrimarias.forEach((chaveP, i) => {
            sql += i === 0 ? `${chaveP} = ?` : ` AND ${chaveP} = ?`
            atributos.push(this.coluna[chaveP])
        })

        return sql
    }

    // deletar
    // buscar
}

class Empresa extends Banco {

    constructor() {
        super()
        
        this.tabela = 'Empresa'
        this.coluna = {
            EmpresaChaveApp: '220599',
            EmpresaCodigo: '1',
            EmpresaRazaoSocial: '',
            EmpresaAppHost: 'escritorio.softros.com.br',
            EmpresaAppUrlBase: '/felipe/rest/',
            EmpresaAppPorta: '80',
            EmpresaAppVersaoAtu: '0',
            EmpresaAppVersaoLib: '0',
            EmpresaLogada: '0',
            FilialLogada: '0',
            UltUpdProduto: new Date(),
        }
        this.chavesPrimarias = ['EmpresaChaveApp', 'EmpresaCodigo'] 

        this.init() // Iniciar
    }

    // Extras

}

const empresa = new Empresa('teste')

console.log(empresa.atualizar())