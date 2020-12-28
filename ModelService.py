import datetime
import os

# CREATE TABLE da tabela que deseja gerar o Model/Service
query = "CREATE TABLE IF NOT EXISTS [ProdutoEmbalagem] ( [produtoCod]  INTEGER NOT NULL,  [ProdutoEmbQtd] INTEGER NOT NULL,  [ProdutoEmbEAN]  INTEGER,  [ProdutoEmbUnd] TEXT,   PRIMARY KEY([produtoCod], [ProdutoEmbQtd]));"

# Configurações iniciais
caminhoBanco = "import Banco from '../functions/Banco'"
caminhoService = "../service/"
caminhoModel = "../model/"

# Configura cabecalho
hoje = datetime.datetime.now()
cabecalho = "// GERADO EM "+str(hoje.strftime("%d/%m/%Y"))+"\n\n"

############################################################################################

# Pega tabela da query
def getTabela():
    x = query.split("[")[1]
    x = x.split("]")[0]
    return x
    
# Pega chaves
def getChaves():
    x = query.split("PRIMARY KEY(")[1]
    x = x.split("[")
    
    chaves = []
    for i in x:
        if i != "":
            y = i.split("]")[0].strip()
            chaves.append(y.strip())
            
    return chaves
    
# Pega atributos
def getAtributos():
    x = query.split("(")[1]
    x = x.split(")")[0]
    x = x.split("[")
    
    atributos = []
    for i in x:
        if i != "":
            y = i.split("]")[0].strip()
            if y not in chaves and y != "":
                atributos.append(y.strip())
    
    return atributos

# Monta Model
def makeModel():
    itens = chaves+atributos
    
    # Cabecalho
    js = cabecalho+"\n"+caminhoBanco+"\n\n"
    
    # Monta colunas
    js += "export const colunas = {\n"
    
    for i in itens:
        js += i+": undefined,\n"
    
    js += "}\n\n"
    
    # Monta funcao principal
    js += "export default class "+tabela+" extends Banco {\n\n"
    
    js += "constructor(atributos) {\n"
    js += "super()\n\n"
    js += "this.tabela = '"+tabela+"'\n"
    js += "this.apelido = ''\n"
    js += "this.base = colunas\n"
    js += "this.coluna = atributos\n"
    js += "this.chavesPrimarias = ["
    
    for i in chaves:
        js += "'"+i+"', "
    
    js += "]\n\n"
    
    js += "this.init()\n"
    js += "}\n\n"
    js += "}"
    
    js = js.replace(", ]", "]")
    return js
    
# Monta Service
def makeService():
    
    # Cabecalho
    js = cabecalho+"\nimport Modelo from '"+caminhoModel+tabela+"'\n\n"
    
    # Monta colunas
    js += "export default class "+tabela+" extends Modelo {\n"
    js += "constructor(atributos) {\n"
    js += "super(atributos)\n"
    js += "}\n"
    js += "}"
    
    return js
    
# Grava pagina
def grava(caminho, pagina):
    if not os.path.isdir(caminho):
        os.mkdir(caminho)
        
    with open(caminho+tabela+".js", "w") as f:
        f.write(pagina)

############################################################################################

# Pega dados
tabela = getTabela()
chaves = getChaves()
atributos = getAtributos()

# Monta páginas
model = makeModel()
service = makeService()

# Gera arquivos
grava("./model/", model) # Gera aquivo {model}.js
grava("./service/", service) # Gera aquivo {service}.js
