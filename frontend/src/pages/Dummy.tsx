{
  /* Project Statistics Section */
}
<div
  className="flex-1 text-left flex p-6 sm:p-10 lg:p-20 gap-5 flex-col justify-center w-full max-w-full"
  style={{ maxWidth: '100vw' }}
>
  <div
    ref={(el) => (cardRefs.current['stats'] = el)}
    data-card-id="stats"
    className={`transition-all duration-1000 ease-out ${getCardAnimationClass(
      'stats'
    )}`}
  >
    <div className="text-center mb-12">
      <h2
        className={`text-3xl md:text-4xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
      >
        Trusted by Thousands Worldwide
      </h2>
      <p
        className={`text-lg ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
      >
        Join our growing community of users leveraging decentralized storage
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {Object.entries(projectStats).map(([key, value], index) => (
        <Card
          key={key}
          className={`text-center hover:scale-105 transition-transform duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800 hover:border-[#00BFFF]'
              : 'bg-white border-gray-200 hover:border-[#00BFFF]'
          }`}
        >
          <CardContent className="pt-6">
            <div
              className={`text-2xl md:text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
            >
              {value}
            </div>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif] capitalize`}
            >
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</div>;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

{
  /* Additional Features with Tabs Section */
}
<div
  className={`py-20 w-full max-w-full ${
    theme === 'dark' ? 'bg-gray-900' : 'bg-[#e6f9ff]'
  }`}
  style={{ maxWidth: '100vw' }}
>
  <div
    ref={(el) => (cardRefs.current['advanced'] = el)}
    data-card-id="advanced"
    className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${getCardAnimationClass(
      'advanced'
    )}`}
  >
    <div className="text-center mb-16">
      <h2
        className={`text-3xl md:text-4xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
      >
        Advanced Features & Capabilities
      </h2>
      <p
        className={`text-lg ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
      >
        Explore the comprehensive suite of tools designed for modern developers
      </p>
    </div>

    <Tabs defaultValue="features" className="w-full">
      <TabsList
        className={`grid w-full grid-cols-2 md:grid-cols-4 mb-8 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="usecases">Use Cases</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>

      <TabsContent value="features" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <Card
              key={index}
              className={`hover:scale-105 transition-transform duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-[#00BFFF]'
                  : 'bg-white border-gray-200 hover:border-[#00BFFF]'
              }`}
            >
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle
                  className={`text-xl ${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                >
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                >
                  {feature.description}
                </p>
                <Badge
                  variant="outline"
                  className={`${
                    theme === 'dark'
                      ? 'border-[#00BFFF] text-[#00BFFF]'
                      : 'border-[#00BFFF] text-[#00BFFF]'
                  }`}
                >
                  {feature.details}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="usecases" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              className={`text-center hover:scale-105 transition-transform duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-[#00BFFF]'
                  : 'bg-white border-gray-200 hover:border-[#00BFFF]'
              }`}
            >
              <CardHeader>
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <CardTitle
                  className={`text-xl ${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                >
                  {useCase.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                >
                  {useCase.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="testimonials" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`hover:scale-105 transition-transform duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <CardTitle
                      className={`text-lg ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                    >
                      {testimonial.name}
                    </CardTitle>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={`italic ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                >
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '$0',
              storage: '5 GB',
              bandwidth: '10 GB/month',
              features: [
                'Basic IPFS storage',
                'Web3 wallet integration',
                'Community support',
              ],
            },
            {
              name: 'Pro',
              price: '$19',
              storage: '100 GB',
              bandwidth: '200 GB/month',
              features: [
                'Advanced encryption',
                'Priority support',
                'API access',
                'Version control',
              ],
              popular: true,
            },
            {
              name: 'Enterprise',
              price: '$99',
              storage: '1 TB',
              bandwidth: 'Unlimited',
              features: [
                'Dedicated support',
                'Custom integrations',
                'SLA guarantee',
                'Advanced analytics',
              ],
            },
          ].map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:scale-105 transition-transform duration-300 ${
                plan.popular
                  ? 'border-2 border-[#00BFFF]'
                  : theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#00BFFF] text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle
                  className={`text-2xl text-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  } font-['Century_Gothic',CenturyGothic,AppleGothic,sans-serif]`}
                >
                  {plan.name}
                </CardTitle>
                <div className="text-center">
                  <span
                    className={`text-4xl font-bold ${
                      theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span
                      className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Storage:
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {plan.storage}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Bandwidth:
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {plan.bandwidth}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      <span className="text-[#00BFFF]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-[#00BFFF] hover:bg-[#0099CC] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </div>
</div>;
