
export id = -> it

export log = -> console.log.apply console, &; &0

export min = Math.min

export max = Math.max

export floor = Math.floor

export round = Math.round

export sin = Math.sin

export cos = Math.cos

export tau = Math.PI * 2

export flip = (λ) -> (a, b) -> λ b, a

export delay = flip set-timeout

export every = flip set-interval

export keys = -> [ k for k, v of it ]

export div = (a, b) --> floor a / b

export random = -> Math.random! * it

export random-from = (list) -> list[ floor random list.length - 1 ]

