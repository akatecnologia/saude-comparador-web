import { Shield } from "lucide-react";
import SEO from "@/components/seo";

export default function Privacidade() {
  return (
    <>
      <SEO
        title="Política de Privacidade"
        description="Política de Privacidade do SaúdeComparador. Saiba como coletamos, usamos e compartilhamos seus dados pessoais conforme a LGPD."
        canonical="https://saudecomparador.com.br/privacidade"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">
            Política de Privacidade
          </h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Última atualização: 18 de fevereiro de 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* 1. Introdução */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Introdução
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              O <strong>SaúdeComparador</strong> ("nós", "nosso"), acessível por
              meio do domínio <em>saudecomparador.com.br</em>, é uma plataforma
              de comparação de planos de saúde desenvolvida e mantida pela{" "}
              <a
                href="https://goworks.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Goworks Tecnologia
              </a>
              , baseada em dados públicos da Agência Nacional de Saúde
              Suplementar (ANS). Esta Política de Privacidade descreve como
              coletamos, utilizamos, armazenamos, compartilhamos e protegemos
              seus dados pessoais, em conformidade com a Lei Geral de Proteção
              de Dados Pessoais (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          {/* 2. Dados coletados */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Dados pessoais coletados
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Coletamos os seguintes dados pessoais quando você preenche nossos
              formulários:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Nome completo</li>
              <li>Número de celular / WhatsApp</li>
              <li>Endereço de e-mail</li>
              <li>Estado (UF) e cidade</li>
              <li>Faixa etária</li>
              <li>Tipo de contratação pretendido (individual, familiar, empresarial)</li>
              <li>Origem da interação (ex.: consulta de preço, assistente IA)</li>
            </ul>
            <p className="text-sm text-gray-700 leading-relaxed mt-3">
              Também coletamos dados técnicos de navegação automaticamente, como
              endereço IP, tipo de navegador, páginas visitadas e tempo de
              permanência, por meio de cookies e tecnologias similares (veja
              seção 6).
            </p>
          </section>

          {/* 3. Finalidades do tratamento */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Finalidades do tratamento
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Seus dados pessoais são tratados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                Exibir informações personalizadas de preços e planos de saúde
                conforme seu perfil (UF, faixa etária, tipo de contratação)
              </li>
              <li>
                Fornecer recomendações por meio do nosso assistente virtual de
                inteligência artificial
              </li>
              <li>
                <strong>
                  Compartilhar seus dados com operadoras de planos de saúde,
                  corretoras e parceiros comerciais autorizados, para que possam
                  apresentar propostas e cotações adequadas ao seu perfil
                </strong>
              </li>
              <li>
                Entrar em contato para oferecer informações complementares
                sobre planos de saúde
              </li>
              <li>
                Enviar comunicações relacionadas ao serviço, incluindo
                atualizações de preços e novos planos compatíveis
              </li>
              <li>
                Melhorar a experiência de navegação e aprimorar nossos serviços
              </li>
              <li>
                Cumprir obrigações legais e regulatórias
              </li>
            </ul>
          </section>

          {/* 4. Base legal */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Base legal para o tratamento
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              O tratamento dos seus dados pessoais é realizado com base no seu{" "}
              <strong>consentimento</strong> (Art. 7º, inciso I, da LGPD),
              obtido de forma livre, informada e inequívoca no momento do
              preenchimento dos nossos formulários. Ao marcar a caixa de
              consentimento, você autoriza expressamente a coleta, o uso e o
              compartilhamento dos seus dados conforme descrito nesta Política.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              Eventualmente, o tratamento poderá se basear também no legítimo
              interesse do controlador (Art. 7º, inciso IX) para fins de
              melhoria dos serviços e análises estatísticas agregadas.
            </p>
          </section>

          {/* 5. Compartilhamento */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Compartilhamento de dados com terceiros
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Seus dados pessoais poderão ser compartilhados com:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                <strong>Operadoras de planos de saúde</strong> — para
                apresentação de propostas comerciais e cotações personalizadas
              </li>
              <li>
                <strong>Corretoras de seguros e planos de saúde</strong> — para
                intermediação e assessoria na contratação de planos
              </li>
              <li>
                <strong>Parceiros comerciais do setor de saúde suplementar</strong>{" "}
                — para ofertas de produtos e serviços complementares
              </li>
              <li>
                <strong>Prestadores de serviços de tecnologia</strong> — para
                hospedagem, análise de dados e funcionamento da plataforma
                (ex.: servidores, serviços de analytics)
              </li>
              <li>
                <strong>Autoridades competentes</strong> — quando exigido por
                lei ou ordem judicial
              </li>
            </ul>
            <p className="text-sm text-gray-700 leading-relaxed mt-3">
              Todos os parceiros que recebem dados pessoais estão sujeitos a
              obrigações de confidencialidade e devem tratar os dados
              exclusivamente para as finalidades informadas.
            </p>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Cookies e tecnologias de rastreamento
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Utilizamos as seguintes tecnologias:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                <strong>Cloudflare Turnstile</strong> — verificação de segurança
                anti-bot para proteção dos formulários
              </li>
              <li>
                <strong>Google Analytics 4 (GA4)</strong> — coleta anônima de
                dados de navegação para análise de uso da plataforma
              </li>
              <li>
                <strong>Cookies funcionais</strong> — armazenamento de
                preferências do usuário (UF, faixa etária) para melhorar a
                experiência
              </li>
            </ul>
            <p className="text-sm text-gray-700 leading-relaxed mt-3">
              Você pode gerenciar as configurações de cookies pelo seu
              navegador. A desativação de determinados cookies pode impactar a
              funcionalidade da plataforma.
            </p>
          </section>

          {/* 7. Direitos do titular */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Seus direitos como titular dos dados
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Nos termos da LGPD, você tem direito a:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                <strong>Confirmação e acesso</strong> — saber se tratamos seus
                dados e obter cópia deles
              </li>
              <li>
                <strong>Correção</strong> — solicitar a atualização de dados
                incompletos, inexatos ou desatualizados
              </li>
              <li>
                <strong>Anonimização, bloqueio ou eliminação</strong> — de dados
                desnecessários ou tratados em desconformidade com a LGPD
              </li>
              <li>
                <strong>Portabilidade</strong> — transferência dos seus dados a
                outro fornecedor de serviço
              </li>
              <li>
                <strong>Eliminação</strong> — excluir dados tratados com base no
                consentimento
              </li>
              <li>
                <strong>Revogação do consentimento</strong> — retirar seu
                consentimento a qualquer momento, sem afetar a licitude do
                tratamento realizado anteriormente
              </li>
              <li>
                <strong>Oposição</strong> — opor-se ao tratamento quando
                realizado com base em legítimo interesse
              </li>
            </ul>
            <p className="text-sm text-gray-700 leading-relaxed mt-3">
              Para exercer qualquer desses direitos, entre em contato conosco
              pelo e-mail indicado na seção 9.
            </p>
          </section>

          {/* 8. Retenção e segurança */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Retenção e segurança dos dados
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Seus dados pessoais são armazenados pelo período necessário para
              cumprir as finalidades descritas nesta Política, ou conforme
              exigido por lei. Adotamos medidas técnicas e organizacionais
              adequadas para proteger seus dados contra acesso não autorizado,
              perda, destruição ou alteração, incluindo criptografia de dados em
              trânsito (HTTPS/TLS), controle de acesso e backups periódicos.
            </p>
          </section>

          {/* 9. Contato / DPO */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Encarregado de Proteção de Dados (DPO)
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Para dúvidas, solicitações ou reclamações relacionadas ao
              tratamento de dados pessoais, entre em contato com nosso
              Encarregado de Proteção de Dados:
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              E-mail:{" "}
              <a
                href="mailto:privacidade@saudecomparador.com.br"
                className="text-primary hover:underline"
              >
                privacidade@saudecomparador.com.br
              </a>
            </p>
          </section>

          {/* 10. Alterações */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Alterações nesta Política
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente.
              Alterações significativas serão comunicadas por meio da plataforma
              ou por e-mail. A data da última atualização estará sempre indicada
              no topo deste documento. Recomendamos a consulta periódica desta
              página.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
