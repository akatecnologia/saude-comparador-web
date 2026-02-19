import { FileText } from "lucide-react";
import SEO from "@/components/seo";

export default function Termos() {
  return (
    <>
      <SEO
        title="Termos de Uso"
        description="Termos de Uso do SaúdeComparador. Condições para utilização da plataforma de comparação de planos de saúde."
        canonical="https://saudecomparador.com.br/termos"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Última atualização: 18 de fevereiro de 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* 1. Aceitação */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Aceitação dos Termos
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Ao acessar e utilizar a plataforma{" "}
              <strong>SaúdeComparador</strong> ("Plataforma"), disponível em{" "}
              <em>saudecomparador.com.br</em>, você declara que leu, entendeu e
              concorda com estes Termos de Uso e com a nossa{" "}
              <a href="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>
              . Caso não concorde com qualquer disposição, interrompa
              imediatamente o uso da Plataforma.
            </p>
          </section>

          {/* 2. Descrição do serviço */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Descrição do serviço
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              O SaúdeComparador é uma plataforma gratuita de comparação de
              planos de saúde, desenvolvida e mantida pela{" "}
              <a
                href="https://goworks.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Goworks Tecnologia
              </a>
              , que utiliza dados públicos da Agência Nacional de Saúde
              Suplementar (ANS). A Plataforma tem caráter exclusivamente
              informativo e <strong>não comercializa</strong> planos de saúde
              diretamente. Seu objetivo é facilitar a consulta e comparação de
              informações sobre operadoras, planos, preços e indicadores de
              qualidade do setor de saúde suplementar no Brasil.
            </p>
          </section>

          {/* 3. Natureza dos dados */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Natureza e fonte dos dados
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Todas as informações sobre planos de saúde, operadoras, preços,
              reajustes e indicadores de qualidade exibidas na Plataforma são
              obtidas de fontes públicas oficiais, incluindo o portal de dados
              abertos da ANS e do governo brasileiro. Os dados têm caráter
              meramente informativo e podem não refletir condições comerciais
              vigentes. Recomendamos que o usuário confirme diretamente com a
              operadora ou corretora as condições, coberturas e valores antes de
              contratar qualquer plano.
            </p>
          </section>

          {/* 4. Cadastro e consentimento */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Cadastro e consentimento
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Para acessar determinadas funcionalidades (como visualização de
              preços e uso do assistente virtual), é necessário fornecer dados
              pessoais por meio dos nossos formulários. Ao preencher seus dados
              e marcar a caixa de consentimento, você autoriza expressamente o
              tratamento dos seus dados conforme descrito na{" "}
              <a href="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>
              , incluindo o compartilhamento com operadoras, corretoras e
              parceiros comerciais do setor de saúde suplementar.
            </p>
          </section>

          {/* 5. Responsabilidades do usuário */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Responsabilidades do usuário
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Ao utilizar a Plataforma, você se compromete a:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Fornecer informações verdadeiras e atualizadas nos formulários</li>
              <li>
                Não utilizar a Plataforma para fins ilícitos ou em
                desconformidade com estes Termos
              </li>
              <li>
                Não realizar ações que possam prejudicar o funcionamento da
                Plataforma, como ataques automatizados, raspagem de dados em
                massa ou tentativas de acesso não autorizado
              </li>
              <li>
                Não reproduzir, distribuir ou comercializar o conteúdo da
                Plataforma sem autorização prévia
              </li>
            </ul>
          </section>

          {/* 6. Limitação de responsabilidade */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Limitação de responsabilidade
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              O SaúdeComparador não garante a exatidão, completude ou
              atualidade das informações exibidas, uma vez que os dados são
              provenientes de fontes públicas e atualizados periodicamente. A
              Plataforma não se responsabiliza por decisões tomadas com base nas
              informações aqui apresentadas, nem por eventuais divergências
              entre os dados exibidos e as condições comerciais praticadas pelas
              operadoras. O uso da Plataforma é feito por conta e risco do
              usuário.
            </p>
          </section>

          {/* 7. Propriedade intelectual */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Propriedade intelectual
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Todo o conteúdo original da Plataforma — incluindo layout, textos,
              logotipo, código-fonte, interface e funcionalidades — é de
              propriedade do SaúdeComparador e está protegido pela legislação
              brasileira de propriedade intelectual. Os dados públicos da ANS
              são utilizados em conformidade com as licenças de dados abertos do
              governo brasileiro. É proibida a reprodução total ou parcial do
              conteúdo original sem autorização prévia por escrito.
            </p>
          </section>

          {/* 8. Modificações */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Modificações dos Termos
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Reservamo-nos o direito de alterar estes Termos de Uso a qualquer
              momento. Alterações significativas serão comunicadas por meio da
              Plataforma. A data da última atualização estará sempre indicada no
              topo deste documento. O uso continuado da Plataforma após
              alterações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* 9. Disposições gerais */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Disposições gerais e foro
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Estes Termos de Uso são regidos pelas leis da República Federativa
              do Brasil. Fica eleito o foro da Comarca de São Paulo, Estado de
              São Paulo, para dirimir quaisquer dúvidas ou controvérsias
              decorrentes destes Termos, com renúncia expressa a qualquer outro,
              por mais privilegiado que seja.
            </p>
          </section>

          {/* 10. Contato */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Contato
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato pelo
              e-mail:{" "}
              <a
                href="mailto:contato@saudecomparador.com.br"
                className="text-primary hover:underline"
              >
                contato@saudecomparador.com.br
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
